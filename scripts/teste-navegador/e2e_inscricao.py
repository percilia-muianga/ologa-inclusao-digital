"""Ensaio no navegador da inscrição por código — só no ambiente separado.

Variáveis: BASE_URL, FORMANDO_EMAIL, FORMANDO_SENHA, CODIGO_ABERTA, CODIGO_PLANEADA.
Recusa correr contra os endereços da plataforma partilhada.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = os.environ["BASE_URL"].rstrip("/")
PROIBIDOS = ("ologainclusaodigital.com", "ologa-staging-priv", "id-preview--caff1b34")
if any(p in BASE for p in PROIBIDOS):
    sys.exit("Recusado: endereço da plataforma partilhada.")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        pg = await (await b.new_context(viewport={"width": 1280, "height": 1800})).new_page()
        await pg.goto(f"{BASE}/entrar")
        await pg.get_by_label("Email").fill(os.environ["FORMANDO_EMAIL"])
        await pg.get_by_label("Palavra-passe").fill(os.environ["FORMANDO_SENHA"])
        await pg.get_by_role("button", name="Entrar").click()
        await pg.wait_for_url("**/painel")
        await pg.goto(f"{BASE}/painel/minhas-turmas")
        campo = pg.get_by_label("Código da turma")
        procurar = pg.get_by_role("button", name="Procurar turma")

        async def tentar(codigo, esperado):
            await campo.fill(codigo); await procurar.click()
            await pg.get_by_text(esperado).wait_for()
            print("ok", codigo, "->", esperado)

        await tentar("ZZZZ9999", "não corresponde a nenhuma turma")
        await tentar(os.environ["CODIGO_PLANEADA"], "não estão abertas")
        await campo.fill(os.environ["CODIGO_ABERTA"]); await procurar.click()
        await pg.get_by_role("button", name="Confirmar inscrição").click()
        await pg.get_by_text("Ficou inscrito").wait_for()
        await pg.get_by_role("link", name="Continuar para as lições").wait_for()
        await pg.screenshot(path="/tmp/inscricao-ok.png")
        await tentar(os.environ["CODIGO_ABERTA"], "Já está inscrito")
        await b.close()

asyncio.run(main())
