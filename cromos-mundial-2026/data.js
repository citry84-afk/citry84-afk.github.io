const teams = {
 FWC:{name:'Especiales FWC',group:'Especiales',flag:'🏆'},
 MEX:{name:'México',group:'Grupo A',flag:'🇲🇽'},RSA:{name:'Sudáfrica',group:'Grupo A',flag:'🇿🇦'},KOR:{name:'Corea del Sur',group:'Grupo A',flag:'🇰🇷'},CZE:{name:'Chequia',group:'Grupo A',flag:'🇨🇿'},
 CAN:{name:'Canadá',group:'Grupo B',flag:'🇨🇦'},BIH:{name:'Bosnia-Herzegovina',group:'Grupo B',flag:'🇧🇦'},QAT:{name:'Qatar',group:'Grupo B',flag:'🇶🇦'},SUI:{name:'Suiza',group:'Grupo B',flag:'🇨🇭'},
 BRA:{name:'Brasil',group:'Grupo C',flag:'🇧🇷'},MAR:{name:'Marruecos',group:'Grupo C',flag:'🇲🇦'},HAI:{name:'Haití',group:'Grupo C',flag:'🇭🇹'},SCO:{name:'Escocia',group:'Grupo C',flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿'},
 USA:{name:'Estados Unidos',group:'Grupo D',flag:'🇺🇸'},PAR:{name:'Paraguay',group:'Grupo D',flag:'🇵🇾'},AUS:{name:'Australia',group:'Grupo D',flag:'🇦🇺'},TUR:{name:'Turquía',group:'Grupo D',flag:'🇹🇷'},
 GER:{name:'Alemania',group:'Grupo E',flag:'🇩🇪'},CUW:{name:'Curazao',group:'Grupo E',flag:'🇨🇼'},CIV:{name:'Costa de Marfil',group:'Grupo E',flag:'🇨🇮'},ECU:{name:'Ecuador',group:'Grupo E',flag:'🇪🇨'},
 NED:{name:'Países Bajos',group:'Grupo F',flag:'🇳🇱'},JPN:{name:'Japón',group:'Grupo F',flag:'🇯🇵'},SWE:{name:'Suecia',group:'Grupo F',flag:'🇸🇪'},TUN:{name:'Túnez',group:'Grupo F',flag:'🇹🇳'},
 BEL:{name:'Bélgica',group:'Grupo G',flag:'🇧🇪'},EGY:{name:'Egipto',group:'Grupo G',flag:'🇪🇬'},IRN:{name:'Irán',group:'Grupo G',flag:'🇮🇷'},NZL:{name:'Nueva Zelanda',group:'Grupo G',flag:'🇳🇿'},
 ESP:{name:'España',group:'Grupo H',flag:'🇪🇸'},CPV:{name:'Cabo Verde',group:'Grupo H',flag:'🇨🇻'},KSA:{name:'Arabia Saudí',group:'Grupo H',flag:'🇸🇦'},URU:{name:'Uruguay',group:'Grupo H',flag:'🇺🇾'},
 FRA:{name:'Francia',group:'Grupo I',flag:'🇫🇷'},SEN:{name:'Senegal',group:'Grupo I',flag:'🇸🇳'},IRQ:{name:'Irak',group:'Grupo I',flag:'🇮🇶'},NOR:{name:'Noruega',group:'Grupo I',flag:'🇳🇴'},
 ARG:{name:'Argentina',group:'Grupo J',flag:'🇦🇷'},ALG:{name:'Argelia',group:'Grupo J',flag:'🇩🇿'},AUT:{name:'Austria',group:'Grupo J',flag:'🇦🇹'},JOR:{name:'Jordania',group:'Grupo J',flag:'🇯🇴'},
 POR:{name:'Portugal',group:'Grupo K',flag:'🇵🇹'},COD:{name:'RD Congo',group:'Grupo K',flag:'🇨🇩'},UZB:{name:'Uzbekistán',group:'Grupo K',flag:'🇺🇿'},COL:{name:'Colombia',group:'Grupo K',flag:'🇨🇴'},
 ENG:{name:'Inglaterra',group:'Grupo L',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},CRO:{name:'Croacia',group:'Grupo L',flag:'🇭🇷'},GHA:{name:'Ghana',group:'Grupo L',flag:'🇬🇭'},PAN:{name:'Panamá',group:'Grupo L',flag:'🇵🇦'}
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
