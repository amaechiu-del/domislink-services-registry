export function mountControlDashboard(root,{load}){
 if(!root||typeof load!=="function")throw Error("Dashboard root and authenticated loader required");
 const doc=root.ownerDocument;
 const heading=doc.createElement("h2");heading.textContent="DomisLink Control Centre";
 const button=doc.createElement("button");button.type="button";button.textContent="Refresh inventory";
 const status=doc.createElement("p");status.setAttribute("role","status");
 const table=doc.createElement("table");
 root.replaceChildren(heading,button,status,table);
 async function refresh(){
 button.disabled=true;status.textContent="Loading";table.replaceChildren();
 try{
 const data=await load();
 if(!Array.isArray(data.services))throw Error("Invalid inventory");
 const header=table.createTHead().insertRow();
 for(const label of ["Application","Repository","Lifecycle","Environment"]){const th=doc.createElement("th");th.scope="col";th.textContent=label;header.append(th);}
 const body=table.createTBody();
 for(const service of data.services.slice(0,250)){
 const row=body.insertRow();
 for(const key of ["name","repository","lifecycle","environment"])row.insertCell().textContent=typeof service[key]==="string"?service[key]:"Unknown";
 }
 status.textContent="Registry metadata only; live deployment status not verified.";
 }catch{table.replaceChildren();status.textContent="Inventory unavailable";}
 finally{button.disabled=false;}
 }
 button.addEventListener("click",refresh);
 return {refresh,destroy(){button.removeEventListener("click",refresh);root.replaceChildren();}};
}
// Host must enforce administrator access and provide a same-origin authenticated loader.
