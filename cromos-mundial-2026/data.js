const teams = {
 FWC:{name:'Especiales FWC',group:'Especiales'},
 MEX:{name:'México',group:'Grupo A'},RSA:{name:'Sudáfrica',group:'Grupo A'},KOR:{name:'Corea del Sur',group:'Grupo A'},CZE:{name:'Chequia',group:'Grupo A'},
 CAN:{name:'Canadá',group:'Grupo B'},BIH:{name:'Bosnia-Herzegovina',group:'Grupo B'},QAT:{name:'Qatar',group:'Grupo B'},SUI:{name:'Suiza',group:'Grupo B'},
 BRA:{name:'Brasil',group:'Grupo C'},MAR:{name:'Marruecos',group:'Grupo C'},HAI:{name:'Haití',group:'Grupo C'},SCO:{name:'Escocia',group:'Grupo C'},
 USA:{name:'Estados Unidos',group:'Grupo D'},PAR:{name:'Paraguay',group:'Grupo D'},AUS:{name:'Australia',group:'Grupo D'},TUR:{name:'Turquía',group:'Grupo D'},
 GER:{name:'Alemania',group:'Grupo E'},CUW:{name:'Curazao',group:'Grupo E'},CIV:{name:'Costa de Marfil',group:'Grupo E'},ECU:{name:'Ecuador',group:'Grupo E'},
 NED:{name:'Países Bajos',group:'Grupo F'},JPN:{name:'Japón',group:'Grupo F'},SWE:{name:'Suecia',group:'Grupo F'},TUN:{name:'Túnez',group:'Grupo F'},
 BEL:{name:'Bélgica',group:'Grupo G'},EGY:{name:'Egipto',group:'Grupo G'},IRN:{name:'Irán',group:'Grupo G'},NZL:{name:'Nueva Zelanda',group:'Grupo G'},
 ESP:{name:'España',group:'Grupo H'},CPV:{name:'Cabo Verde',group:'Grupo H'},KSA:{name:'Arabia Saudí',group:'Grupo H'},URU:{name:'Uruguay',group:'Grupo H'},
 FRA:{name:'Francia',group:'Grupo I'},SEN:{name:'Senegal',group:'Grupo I'},IRQ:{name:'Irak',group:'Grupo I'},NOR:{name:'Noruega',group:'Grupo I'},
 ARG:{name:'Argentina',group:'Grupo J'},ALG:{name:'Argelia',group:'Grupo J'},AUT:{name:'Austria',group:'Grupo J'},JOR:{name:'Jordania',group:'Grupo J'},
 POR:{name:'Portugal',group:'Grupo K'},COD:{name:'RD Congo',group:'Grupo K'},UZB:{name:'Uzbekistán',group:'Grupo K'},COL:{name:'Colombia',group:'Grupo K'},
 ENG:{name:'Inglaterra',group:'Grupo L'},CRO:{name:'Croacia',group:'Grupo L'},GHA:{name:'Ghana',group:'Grupo L'},PAN:{name:'Panamá',group:'Grupo L'}
};

const initial = {
 missing:{
  FWC:[2,4,15,16,18,19],MEX:[20],RSA:[16],KOR:[3,9],CZE:[],CAN:[1,8,12],BIH:[11],QAT:[1,9,18],SUI:[3],
  BRA:[3,14],MAR:[6,11],HAI:[2],SCO:[3,5,7],USA:[],PAR:[11,14],AUS:[15],TUR:[17,18],GER:[1,4,19],CUW:[14],CIV:[16],ECU:[16],
  NED:[8],JPN:[],SWE:[],TUN:[4,13,14,15,18],BEL:[8,17],EGY:[9],IRN:[],NZL:[8,17],ESP:[9,18,20],CPV:[6,20],KSA:[2,5,18],URU:[2,6,19,20],
  FRA:[],SEN:[],IRQ:[10,11,15],NOR:[1],ARG:[2,10,14,20],ALG:[1,7,10],AUT:[5],JOR:[],POR:[],COD:[4],UZB:[],COL:[3,12,15,16,17],
  ENG:[5,10,15,16,18],CRO:[5,14,20],GHA:[4],PAN:[13,17,20]
 },
 uncertain:{BRA:[6,11]},
 repeats:{
  FWC:{10:1},MEX:{},RSA:{},KOR:{},CZE:{11:1},CAN:{14:2,17:1},BIH:{3:1},QAT:{},SUI:{},BRA:{20:1},MAR:{},HAI:{16:1},SCO:{8:1,13:1},
  USA:{12:1},PAR:{},AUS:{6:2},TUR:{1:2,5:1,14:2},GER:{17:1},CUW:{17:2},CIV:{},ECU:{},NED:{},JPN:{6:1},SWE:{20:1},TUN:{},
  BEL:{},EGY:{1:1},IRN:{1:1},NZL:{2:1,3:1,10:1},ESP:{5:1},CPV:{1:1,15:1},KSA:{},URU:{13:1},FRA:{3:1},SEN:{},IRQ:{19:1},NOR:{10:1,19:1},
  ARG:{19:1},ALG:{},AUT:{},JOR:{7:1,12:1},POR:{},COD:{1:2,13:2,19:2},UZB:{12:1},COL:{14:1},ENG:{7:1,13:1},CRO:{13:1},GHA:{7:1,18:1},PAN:{1:2,14:1}
 }
};
