# Ensaio real de materiais (envio, abertura, descarga, vídeo com legendas)

Os ensaios em `scripts/teste-materiais` usam armazenamento simulado e **não**
concluem esta verificação. Este ensaio usa o browser e o armazenamento real,
e por isso só pode correr contra um **ambiente isolado** (cópia de trabalho com
base e armazenamento próprios). Recusa correr contra a pré-visualização e o
site publicado, que partilham a base real.

## O que faz
1. `gerar-ficheiros.sh` cria em `/tmp/teste-envio-real/` um PDF, um vídeo MP4
   de 6 s e uma legenda WebVTT pt, todos fictícios.
2. `e2e.py`, como Administradora Geral: abre Painel → Editar lições, escolhe a
   primeira lição, anexa PDF, vídeo e legenda (ligada ao vídeo), confirma que
   ficam «indisponíveis», disponibiliza-os e substitui o PDF.
3. Como formando: abre a lição, confirma a secção «Materiais da lição», pede
   o PDF por «Abrir» (HTTP 200, `application/pdf`), descarrega pelo botão
   «Descarregar», reproduz o vídeo (o tempo avança) e confirma que a faixa de
   legendas carregou com as falas esperadas.
4. Retira o PDF e confirma que o formando deixa de o ver e que a ligação
   directa antiga deixa de funcionar ao expirar/renovar.

## Como correr (no ambiente isolado)
```
bash scripts/teste-envio-real/gerar-ficheiros.sh
AMBIENTE_ISOLADO=sim BASE_URL=<endereço do ambiente isolado> \
SESSAO_ADMIN=<ficheiro de sessão admin> SESSAO_FORMANDO=<ficheiro de sessão formando> \
python3 scripts/teste-envio-real/e2e.py
```
Os ficheiros de sessão têm o formato gerado por `lovable auth-session --json`.
Capturas e ficheiros descarregados ficam em `/tmp/teste-envio-real/`.

## Estado
Preparado, **não executado**: falta um ambiente isolado com armazenamento real.
