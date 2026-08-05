(()=>{
  'use strict';
  const A=window.FFLab;
  if(!A||A.__ADJUSTED_FIX_1520__)return;
  A.__ADJUSTED_FIX_1520__=true;
  const view=A.views.options;
  A.views.options=()=>{
    const doc=new DOMParser().parseFromString(`<div id="v1520">${view()}</div>`,'text/html');
    const root=doc.querySelector('#v1520');
    root.querySelectorAll('.notice').forEach(node=>node.remove());
    if(root.querySelector('.adjusted-options-hero'))root.insertAdjacentHTML('beforeend','<div class="notice"><b>Criterio honesto:</b> opciones realizadas ajustadas = resultado realizado de opciones + ganancia o pérdida de las acciones originadas por asignaciones. Las acciones abiertas se valoran al último precio disponible y el porcentaje se calcula sobre el NAV final de la cuenta IBKR. No es un cálculo fiscal.</div>');
    return root.innerHTML;
  };
})();
