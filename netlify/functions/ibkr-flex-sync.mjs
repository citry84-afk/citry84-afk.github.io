const BASE='https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const tag=(xml,name)=>xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`,'i'))?.[1]?.trim()||'';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});

export default async function handler(req){
  if(req.method!=='POST')return json({error:'Método no permitido'},405);
  const supplied=req.headers.get('x-finanzasfacil-secret')||'';
  const secret=process.env.FF_SYNC_SECRET||'';
  if(!secret||supplied!==secret)return json({error:'No autorizado'},401);
  const token=process.env.IBKR_FLEX_TOKEN||'';
  const queryId=process.env.IBKR_FLEX_QUERY_ID||'';
  if(!token||!queryId)return json({error:'Faltan IBKR_FLEX_TOKEN o IBKR_FLEX_QUERY_ID'},503);
  const headers={'user-agent':'FinanzasFacil/0.14 (+https://finanzasmuyfacil.com)','accept':'application/xml,text/csv,text/plain,*/*'};
  try{
    const sendUrl=new URL(BASE+'/SendRequest');sendUrl.search=new URLSearchParams({t:token,q:queryId,v:'3'});
    const sendResponse=await fetch(sendUrl,{headers});const sendText=await sendResponse.text();
    const status=tag(sendText,'Status'),reference=tag(sendText,'ReferenceCode'),sendError=tag(sendText,'ErrorMessage'),sendCode=tag(sendText,'ErrorCode');
    if(!sendResponse.ok||status!=='Success'||!reference)return json({error:sendError||'IBKR no generó el informe',code:sendCode||sendResponse.status},502);
    let report='';let lastCode='';
    for(let attempt=0;attempt<7;attempt++){
      if(attempt)await sleep(Math.min(1000*2**attempt,8000));
      const getUrl=new URL(BASE+'/GetStatement');getUrl.search=new URLSearchParams({t:token,q:reference,v:'3'});
      const response=await fetch(getUrl,{headers});const text=await response.text();
      const code=tag(text,'ErrorCode');lastCode=code;
      if(response.ok&&!code&&!text.includes('<Status>Fail</Status>')){report=text;break;}
      if(!['1003','1004','1019'].includes(code))return json({error:tag(text,'ErrorMessage')||'No se pudo recuperar el informe',code:code||response.status},502);
    }
    if(!report)return json({error:'El informe sigue generándose',code:lastCode||'1019'},202);
    return new Response(report,{status:200,headers:{'content-type':report.trim().startsWith('<')?'application/xml;charset=utf-8':'text/csv;charset=utf-8','cache-control':'no-store','x-ff-flex-reference':reference}});
  }catch(error){console.error('[ibkr-flex-sync]',error);return json({error:'Error interno al consultar IBKR'},500)}
}
export const config={path:'/api/ibkr-flex-sync'};
