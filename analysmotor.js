/* analysmotor.js — fristående, regelbaserad sökning i analysbiblioteket */
(function(global){
  "use strict";
  function normCall(x){return String(x||"").trim().replace(/♣/g,"♣").replace(/C$/i,"♣").replace(/D$/i,"♦").replace(/H$/i,"♥").replace(/S$/i,"♠").replace(/^1N$/i,"1NT").replace(/^2N$/i,"2NT").replace(/^3N$/i,"3NT").replace(/^4N$/i,"4NT").toUpperCase();}
  function normSeq(seq){return (seq||[]).map(normCall);}
  function findNode(lib,id){for(const t of lib.trees||[]){const n=(t.nodes||[]).find(x=>x.id===id);if(n)return {tree:t,node:n};}return null;}
  function getTree(lib,id){return (lib.trees||[]).find(t=>t.id===id)||null;}
  function getNode(lib,id){return findNode(lib,id);}
  function match(lib,auction){
    const q=normSeq(auction), hits=[];
    for(const tree of lib.trees||[]){
      for(const node of tree.nodes||[]){
        const s=normSeq(node.sequence||[]);
        if(s.length<=q.length && s.every((v,i)=>v==="…"||v===q[i])){
          hits.push({tree,node,matchedLength:s.length,exact:s.length===q.length});
        }
      }
    }
    hits.sort((a,b)=>b.matchedLength-a.matchedLength);
    return hits[0]||null;
  }
  function branches(lib,nodeId){const found=findNode(lib,nodeId);return found?found.node.branches||[]:[];}
  return global.BudAnalys={
    version:"0.1.0",
    getTree,
    getNode,
    match,
    branches,
    normalizeSequence:normSeq
  };
})(typeof window!=="undefined"?window:globalThis);
