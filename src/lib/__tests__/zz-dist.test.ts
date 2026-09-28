import { it } from "vitest";
import { EXAME_REDES, PROPOSTA_PROVA_REDES, ordemModuloRedes } from "../../../scripts/conteudo/redes-questoes";
import { quotasDificuldade } from "../../../src/lib/quotas-exame";
import { geradorComSemente, sortearExame } from "../../../src/lib/sorteio-exame";
const T={em:"escolha_multipla",vf:"verdadeiro_falso",cor:"correspondencia"} as any; const D={f:"facil",me:"media",di:"dificil"} as any;
it("d",()=>{
 const rows:Record<string,string[]>={};
 for(const q of EXAME_REDES){const m=ordemModuloRedes(q);(rows[m]??=[]).push(`${q.cod.slice(4)}:${q.cen?"cen":q.t}/${q.d}`);}
 for(const k of Object.keys(rows).sort((a,b)=>+a-+b)) console.log(k, rows[k]!.join(" "));
 const OV:Record<string,string>=JSON.parse(process.env.OV||"{}");
 const b=EXAME_REDES.map(q=>q.cod in OV?{...q,d:OV[q.cod]}:q).map((q:any)=>({id:q.cod,moduloId:String(ordemModuloRedes(q)),tipologia:T[q.t],dificuldade:D[q.d],cenario:!!q.cen}));
 const quotas={total:20,dificuldade:quotasDificuldade(20,PROPOSTA_PROVA_REDES.pct),modulos:Object.fromEntries(Object.entries(PROPOSTA_PROVA_REDES.modulosPorOrdem)),tipos:{...PROPOSTA_PROVA_REDES.tipos}} as any;
 const f=[];for(let s=1;s<=200;s++){if(!sortearExame(b,quotas,geradorComSemente(s)).ok)f.push(s);} console.log("falhas",f.length,f);
},120000);
