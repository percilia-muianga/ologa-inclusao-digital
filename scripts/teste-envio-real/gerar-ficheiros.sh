#!/bin/bash
# Gera ficheiros fictícios para o ensaio real. Só escreve em /tmp.
set -euo pipefail
D=/tmp/teste-envio-real; mkdir -p "$D"
python3 - "$D" <<'PY'
import sys
d=sys.argv[1]
def pdf(path, texto):
    stream=f"BT /F1 24 Tf 72 720 Td ({texto}) Tj ET".encode()
    objs=[b"<< /Type /Catalog /Pages 2 0 R >>", b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
          b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
          b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream",
          b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
    out=b"%PDF-1.4\n"; offs=[]
    for i,o in enumerate(objs,1):
        offs.append(len(out)); out+=b"%d 0 obj\n" % i + o + b"\nendobj\n"
    x=len(out); out+=b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs)+1)
    for o in offs: out+=b"%010d 00000 n \n" % o
    out+=b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs)+1, x)
    open(path,"wb").write(out)
pdf(f"{d}/ensaio-v1.pdf","Ensaio ficticio - versao 1")
pdf(f"{d}/ensaio-v2.pdf","Ensaio ficticio - versao 2")
open(f"{d}/ensaio.vtt","w").write("WEBVTT\n\n00:00.000 --> 00:03.000\nLegenda de ensaio um\n\n00:03.000 --> 00:06.000\nLegenda de ensaio dois\n")
PY
ffmpeg -y -loglevel error -f lavfi -i testsrc=size=320x240:rate=15 -f lavfi -i sine=frequency=440 \
  -t 6 -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart "$D/ensaio.mp4"
ls -l "$D"
