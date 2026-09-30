"""Ensaio real de materiais contra um AMBIENTE ISOLADO. Ver README.md."""
import asyncio, json, os, sys
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright, expect

D = Path("/tmp/teste-envio-real")
BASE = os.environ.get("BASE_URL", "").rstrip("/")
PARTILHADOS = {
    "localhost:8080",  # pré-visualização local, ligada à base partilhada
    "id-preview--caff1b34-3310-45c3-980d-255c19152c02.lovable.app",
    "ologa-staging-priv-9k3m2.lovable.app",
}
if os.environ.get("AMBIENTE_ISOLADO") != "sim" or not BASE:
    sys.exit("Recusado: defina AMBIENTE_ISOLADO=sim e BASE_URL do ambiente isolado.")
if urlparse(BASE).netloc in PARTILHADOS:
    sys.exit("Recusado: este endereço usa a base partilhada.")
for f in ("ensaio-v1.pdf", "ensaio-v2.pdf", "ensaio.mp4", "ensaio.vtt"):
    if not (D / f).exists():
        sys.exit(f"Falta {f}: corra gerar-ficheiros.sh primeiro.")

resultados: list[tuple[str, bool, str]] = []
def ok(nome, cond, det=""):
    resultados.append((nome, bool(cond), det)); print(("PASSOU " if cond else "FALHOU ") + nome, det)

async def sessao(browser, ficheiro):
    m = json.load(open(os.path.expanduser(ficheiro)))
    ctx = await browser.new_context(viewport={"width": 1280, "height": 1800}, accept_downloads=True)
    pg = await ctx.new_page()
    await pg.goto(BASE)
    await pg.evaluate(f"localStorage.setItem({json.dumps(m['storage_key'])},{json.dumps(json.dumps(m['session']))})")
    return ctx, pg

async def anexar(pg, tipo, ficheiro, titulo, legenda_de=None):
    f = pg.locator("form", has=pg.get_by_role("heading", name="Anexar material"))
    await f.get_by_label("Tipo").select_option(tipo)
    await f.locator("input[type=file]").set_input_files(str(D / ficheiro))
    await f.get_by_label("Título").fill(titulo)
    if legenda_de:
        await f.get_by_label("Legenda do vídeo").select_option(label=legenda_de)
    if tipo == "video":
        await f.get_by_label("Descrição acessível").fill("Vídeo de ensaio com barras de cor e um tom contínuo.")
    await f.get_by_role("button", name="Anexar material").click()
    await expect(pg.get_by_text("Material anexado")).to_be_visible(timeout=60000)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        actx, apg = await sessao(b, os.environ["SESSAO_ADMIN"])
        await apg.goto(f"{BASE}/painel/licoes")
        await apg.get_by_role("button").filter(has_text="1.").first.click()
        await anexar(apg, "pdf", "ensaio-v1.pdf", "PDF de ensaio")
        await anexar(apg, "video", "ensaio.mp4", "Vídeo de ensaio")
        await anexar(apg, "legenda", "ensaio.vtt", "Legenda de ensaio", legenda_de="Vídeo de ensaio")
        ok("três materiais anexados e indisponíveis", await apg.get_by_text("indisponível", exact=False).count() >= 3)
        for t in ("PDF de ensaio", "Vídeo de ensaio", "Legenda de ensaio"):
            item = apg.locator("li", has_text=t).first
            await item.get_by_label("Disponibilizar aos formandos").check()
            await item.get_by_role("button", name="Guardar").click()
            await apg.wait_for_timeout(1500)
        item = apg.locator("li", has_text="PDF de ensaio").first
        await item.locator("input[type=file]").set_input_files(str(D / "ensaio-v2.pdf"))
        await apg.wait_for_timeout(3000)
        await apg.screenshot(path=str(D / "1_admin.png"))
        licao_url = await apg.evaluate("location.href")

        fctx, fpg = await sessao(b, os.environ["SESSAO_FORMANDO"])
        # A lição aberta no editor é a primeira; o formando abre-a pela rota pública.
        destino = os.environ.get("URL_LICAO") or licao_url
        await fpg.goto(destino)
        sec = fpg.get_by_role("region", name="Materiais da lição")
        await expect(sec).to_be_visible(timeout=30000)
        abrir = sec.locator("li", has_text="PDF de ensaio").get_by_role("link", name="Abrir").first
        href = await abrir.get_attribute("href")
        r = await fctx.request.get(href)
        corpo = await r.body()
        ok("PDF abre (200, application/pdf, versão 2)", r.status == 200 and "pdf" in r.headers.get("content-type", "") and b"versao 2" in corpo, str(r.status))
        async with fpg.expect_download() as dl:
            await sec.locator("li", has_text="PDF de ensaio").get_by_role("link", name="Descarregar").first.click()
        d = await dl.value; await d.save_as(str(D / "descarregado.pdf"))
        ok("PDF descarregado", (D / "descarregado.pdf").stat().st_size > 200)
        estado = await fpg.evaluate("""async () => {
          const v = document.querySelector('video'); if (!v) return {erro:'sem video'};
          v.muted = true; await v.play().catch(e=>{}); await new Promise(r=>setTimeout(r,2500));
          const t = v.textTracks[0]; if (t) t.mode = 'showing'; await new Promise(r=>setTimeout(r,1000));
          return {tempo: v.currentTime, faixas: v.textTracks.length,
                  falas: t && t.cues ? Array.from(t.cues).map(c=>c.text) : []};
        }""")
        ok("vídeo reproduz", estado.get("tempo", 0) > 1, json.dumps(estado))
        ok("legendas carregadas", "Legenda de ensaio um" in estado.get("falas", []))
        await fpg.screenshot(path=str(D / "2_formando.png"))

        item = apg.locator("li", has_text="PDF de ensaio").first
        await item.get_by_label("Disponibilizar aos formandos").uncheck()
        await item.get_by_role("button", name="Guardar").click()
        await apg.wait_for_timeout(2000)
        await fpg.reload()
        await fpg.wait_for_timeout(4000)
        ok("PDF retirado deixa de aparecer ao formando", await fpg.get_by_text("PDF de ensaio").count() == 0)
        await b.close()
    falhas = [r for r in resultados if not r[1]]
    print(f"\n{len(resultados) - len(falhas)} de {len(resultados)} verificações passaram.")
    sys.exit(1 if falhas else 0)

asyncio.run(main())
