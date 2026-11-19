/* Gemensamma regler för svar och öppnarens återbud efter 1 i färg. */
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports) module.exports=factory;
 else root.RattningEttOppningsSvarFactory=factory;
})(typeof globalThis!=='undefined'?globalThis:this,function(api){
 var svarFactory=(typeof module!=='undefined'&&module.exports)?require('./svar1farg.js'):window.RattningSvar1Factory;
 var aterbudFactory=(typeof module!=='undefined'&&module.exports)?require('./aterbud1farg.js'):window.RattningAterbud1Factory;
 return {resp1:svarFactory(api).resp1,reb1:aterbudFactory(api).reb1};
});
