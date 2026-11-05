/* ==========================================================================
   data.js - Contenus de l'outil « Gérer les conflits »

   Sources :
   - issus du support « Simulations_gestion_conflits_J3 » : cadre de jeu,
     six situations (famille, titre, contexte, décisions à prendre, repères
     pour agir, réplique) et conseil formateur ;
   - rédigés pour l'outil : fiches confidentielles des collaborateurs,
     grille d'observation universelle, questions de débriefing.

   Rôles : m = manager, c1 = collaborateur 1, c2 = collaborateur 2 (si prévu),
   o = observateur (un participant s'il en reste un, sinon le formateur).
   Une situation sans « c2 » se joue avec manager + 1 collaborateur.

   Rappel : le cloisonnement des rôles est pédagogique, pas informatique.
   Toute personne qui ouvre ce fichier peut lire tous les contenus.
   ========================================================================== */
window.CONFLITS_DATA = {
  titre: "Gérer les conflits",
  sousTitre: "Mises en situation pour décider, intervenir et restaurer la coopération",
  dureeSimulation: 420,   /* 7 minutes */
  alerteSecondes: 60,

  roles: {
    m:  { label: "Manager",         court: "Manager",
          desc: "Vous devez décider comment intervenir, puis conduire l’échange." },
    c1: { label: "Collaborateur 1", court: "Collab. 1",
          desc: "Vous jouez un protagoniste du conflit, à partir de votre fiche confidentielle." },
    c2: { label: "Collaborateur 2", court: "Collab. 2",
          desc: "Vous jouez un second protagoniste du conflit, à partir de votre fiche confidentielle." },
    o:  { label: "Observateur",     court: "Observ.",
          desc: "Vous observez sans intervenir et vous renseignez la grille d’observation." }
  },

  /* Cadre de jeu commun (support, diapositive « Cadre de jeu ») */
  cadre: {
    titre: "Avant d’intervenir : que doit décider le manager ?",
    etapes: [
      { nom: "Qualifier",       question: "Désaccord, tension, conflit ou risque grave ?" },
      { nom: "Sécuriser",       question: "Faut-il stopper, séparer, protéger ou recueillir les faits ?" },
      { nom: "Choisir",         question: "Entretiens séparés, médiation, recadrage ou alerte RH ?" },
      { nom: "Conduire",        question: "Faire préciser faits, impacts, besoins et demandes." },
      { nom: "Contractualiser", question: "Décider des règles, actions, responsables et suivi." }
    ],
    enjeu: "Ne pas rechercher un coupable. Rétablir un cadre de travail sûr, équitable et opérationnel.",
    decisions: "Décisions à prendre : intervenir maintenant ou différer ? Qui entendre ? Quel format ? Quelle limite poser ? Quel suivi organiser ?",
    regle: "Le manager dispose de 7 minutes. Il doit expliciter sa stratégie avant de conclure.",
    fin: "Terminez par une décision finale et un suivi daté."
  },

  /* Règles communes aux collaborateurs (rôles c1 et c2) */
  reglesCollab: [
    "Ne révélez pas immédiatement toutes les informations de votre fiche.",
    "Aux questions fermées, répondez brièvement. Aux questions ouvertes, aux demandes d’exemples et aux reformulations, donnez progressivement davantage.",
    "Si le manager vous reçoit séparément, attendez votre tour et ne montrez pas votre fiche à l’autre participant.",
    "Restez crédible et respectueux : jouez la tension, pas la violence. En cas de gêne, vous pouvez sortir du rôle à tout moment."
  ],

  /* Déroulé d'animation (support, diapositive « Conseil formateur ») */
  deroule: [
    { id: "projeter",   nom: "Projeter",   minutes: 1, consigne: "Contexte commun uniquement." },
    { id: "distribuer", nom: "Distribuer", minutes: 2, consigne: "Briefs privés via les liens ou QR codes de chaque rôle." },
    { id: "simuler",    nom: "Simuler",    minutes: 7, consigne: "Manager, protagonistes, observateur." },
    { id: "debriefer",  nom: "Débriefer",  minutes: 6, consigne: "Auto-retour, vécu du rôle, faits observés." },
    { id: "rejouer",    nom: "Rejouer",    minutes: 3, consigne: "Une séquence ciblée améliorée." }
  ],

  debrief: {
    manager: "Auto-retour du manager : qu’avez-vous décidé et pourquoi ? Que referiez-vous autrement ?",
    collaborateurs: "Vécu du rôle : à quel moment vous êtes-vous senti écouté ? Qu’est-ce qui vous a fait durcir ou vous a apaisé ?",
    observateur: "Faits observés : quels faits précis ? Quelles étapes du cadre (qualifier, sécuriser, choisir, conduire, contractualiser) ont été couvertes ?",
    rejeu: "Choisissez une séquence précise à rejouer en 3 minutes, avec une amélioration ciblée."
  },

  /* ----------------------------------------------------------------------
     SITUATIONS
     ---------------------------------------------------------------------- */
  situations: [
    /* ---------------- 01 ---------------- */
    {
      id: 1, num: "01", famille: "Coopération dégradée", titre: "La rétention d’information",
      contexte: "Deux experts performants ne se transmettent plus les informations utiles. Chacun accuse l’autre de provoquer retards et erreurs. Une livraison client est prévue dans 48 heures.",
      decisions: [
        "Sécuriser immédiatement la livraison ?",
        "Recevoir séparément ou ensemble ?",
        "Traiter les faits ou la relation en premier ?"
      ],
      reperes: [
        "Cartographier les informations manquantes et les impacts.",
        "Recueillir séparément les faits vérifiables.",
        "Organiser une rencontre centrée sur le flux de travail.",
        "Fixer une règle de transmission et un point de contrôle."
      ],
      citation: "Je ne partagerai plus rien tant qu’il ne reconnaît pas ses erreurs.",
      acteurs: {
        c1: {
          titre: "Expert n°1",
          profil: "Vous jouez l’expert n°1. Vous êtes performant et attaché à la qualité de votre travail. Vous estimez que l’expert n°2 a commis des erreurs qui ont retardé le projet, sans jamais les reconnaître.",
          vecu: [
            "vous avez alerté plusieurs fois sans être entendu ;",
            "vous avez cessé de transmettre vos informations pour ne plus être mis en cause ;",
            "vous détenez des informations indispensables à la livraison dans 48 heures."
          ],
          veut: [
            "que vos alertes soient reconnues ;",
            "que l’on ne vous attribue pas les retards ;",
            "ne plus avoir à justifier votre travail."
          ],
          ouverture: "Je ne partagerai plus rien tant qu’il ne reconnaît pas ses erreurs.",
          jeu: [
            "Si le manager cherche un coupable ou tranche vite, maintenez votre position.",
            "S’il vous demande des faits précis et datés, donnez-les un par un.",
            "S’il sépare la sécurisation de la livraison de la discussion sur la relation, acceptez de transmettre l’information indispensable à la livraison, mais pas davantage.",
            "S’il propose une règle de transmission et un point de contrôle, acceptez-la si elle vaut pour les deux experts."
          ]
        },
        c2: {
          titre: "Expert n°2",
          profil: "Vous jouez l’expert n°2. Vous êtes performant et vous vous sentez mis à l’écart. Vous estimez que l’expert n°1 vous cache des informations depuis plusieurs semaines, ce qui vous met en difficulté devant le client.",
          vecu: [
            "vous découvrez trop tard des informations qui vous manquent ;",
            "certaines erreurs qu’on vous reproche viennent de cette information manquante ;",
            "vous craignez d’être tenu pour responsable si la livraison échoue."
          ],
          veut: [
            "recevoir les informations utiles à temps ;",
            "que l’on distingue vos erreurs réelles de celles liées au manque d’information ;",
            "livrer au client sans être mis en défaut."
          ],
          ouverture: "Comment voulez-vous que je livre correctement si on ne me dit rien ?",
          jeu: [
            "Si les deux experts sont réunis sans cadre, interrompez et renvoyez la faute.",
            "Si le manager centre l’échange sur le flux de travail (informations manquantes, impacts), donnez des exemples datés.",
            "Si le manager vous demande de reconnaître vos erreurs en premier, durcissez-vous.",
            "Acceptez une règle de transmission seulement si elle est réciproque et suivie d’un point de contrôle."
          ]
        }
      }
    },

    /* ---------------- 02 ---------------- */
    {
      id: 2, num: "02", famille: "Autorité contestée", titre: "L’expert qui conteste le manager",
      contexte: "Un collaborateur très expérimenté conteste régulièrement les décisions du manager devant l’équipe. Ses arguments sont parfois pertinents, mais la forme fragilise le cadre collectif.",
      decisions: [
        "Recadrer immédiatement ou en entretien ?",
        "Reconnaître la compétence sans céder le rôle ?",
        "Transformer l’opposition en contribution ?"
      ],
      reperes: [
        "Stopper l’attaque personnelle sans débattre devant tous.",
        "Distinguer expertise technique et responsabilité d’arbitrage.",
        "Explorer les faits et risques signalés en entretien.",
        "Convenir d’un canal de désaccord professionnel."
      ],
      citation: "Vous ne connaissez pas assez le métier pour décider cela.",
      acteurs: {
        c1: {
          titre: "Le collaborateur très expérimenté",
          profil: "Vous jouez un collaborateur très expérimenté. Vous contestez régulièrement les décisions de votre manager, y compris devant l’équipe. Vous estimez que votre expérience du métier n’est pas prise en compte.",
          vecu: [
            "vous avez déjà vu des décisions semblables échouer ;",
            "vous avez signalé un risque technique réel sur la dernière décision, sans réponse claire ;",
            "vous supportez mal d’apprendre les décisions après coup."
          ],
          veut: [
            "être consulté avant les décisions qui touchent votre domaine ;",
            "que votre expertise soit reconnue ;",
            "ne pas être recadré devant les autres."
          ],
          ouverture: "Vous ne connaissez pas assez le métier pour décider cela.",
          jeu: [
            "Si le manager vous recadre ou vous répond devant tous, durcissez-vous : mettez en avant votre ancienneté.",
            "S’il reconnaît votre compétence sans céder sa responsabilité de décision, détaillez le risque que vous avez signalé.",
            "S’il explore vos faits et vos risques en entretien, devenez plus constructif et proposez des solutions.",
            "S’il propose un canal pour exprimer votre désaccord (point régulier, avis avant décision), acceptez-le en précisant que le manager arbitre."
          ]
        }
      }
    },

    /* ---------------- 03 ---------------- */
    {
      id: 3, num: "03", famille: "Conflit de contribution", titre: "La bataille de la reconnaissance",
      contexte: "Deux collaborateurs revendiquent la réussite du même projet. Chacun estime que l’autre s’approprie son travail. Le conflit se diffuse dans l’équipe et les collègues prennent parti.",
      decisions: [
        "Reconstruire les contributions ou arbitrer vite ?",
        "Faut-il recevoir les personnes séparément ?",
        "Comment éviter le concours de légitimité ?"
      ],
      reperes: [
        "Lister livrables, décisions et contributions factuelles.",
        "Explorer ce que chacun cherche à faire reconnaître.",
        "Conduire une rencontre sans établir un « vainqueur ».",
        "Clarifier les règles futures de visibilité et de crédit."
      ],
      citation: "Sans moi, ce projet n’aurait jamais abouti.",
      acteurs: {
        c1: {
          titre: "Le collaborateur à l’origine du projet",
          profil: "Vous jouez le collaborateur qui a imaginé et lancé le projet : idée de départ, cadrage et premières versions. Vous estimez que l’autre collaborateur s’est approprié la réussite.",
          vecu: [
            "vous avez porté le projet quand personne n’y croyait ;",
            "votre nom n’a pas été cité lors de la présentation des résultats ;",
            "des collègues vous donnent raison et vous en avez parlé à plusieurs."
          ],
          veut: [
            "que l’origine du projet soit reconnue ;",
            "être cité dans les prochaines communications ;",
            "ne pas passer pour quelqu’un qui revendique."
          ],
          ouverture: "Sans moi, ce projet n’aurait jamais abouti.",
          jeu: [
            "Si le manager tranche vite en désignant un « vainqueur », protestez et menacez d’en parler à l’équipe.",
            "S’il vous fait lister les livrables, les décisions et vos contributions concrètes, soyez précis et reconnaissez une partie du travail de l’autre.",
            "S’il explore ce que vous voulez faire reconnaître, dites-le franchement : l’origine du projet.",
            "Acceptez des règles de visibilité et de crédit si elles valent pour tout le monde."
          ]
        },
        c2: {
          titre: "Le collaborateur qui a finalisé le projet",
          profil: "Vous jouez le collaborateur qui a réalisé et finalisé le projet : développement, livraison et coordination des derniers mois. Vous estimez que l’autre s’approprie votre travail sans en avoir assumé la charge.",
          vecu: [
            "vous avez fait l’essentiel du travail de livraison, souvent en fin de journée ;",
            "l’autre collaborateur est surtout apparu au début et lors de la présentation ;",
            "des collègues prennent parti, ce qui vous isole."
          ],
          veut: [
            "que l’effort de réalisation soit reconnu ;",
            "que le crédit soit proportionné au travail effectué ;",
            "que les collègues cessent de prendre parti."
          ],
          ouverture: "Et qui l’a livré, ce projet ? Pas vous.",
          jeu: [
            "Si le manager tranche vite en désignant un « vainqueur », protestez et menacez d’en parler à l’équipe.",
            "S’il vous fait lister les livrables, les décisions et vos contributions concrètes, soyez précis et reconnaissez la part de l’autre dans l’idée de départ.",
            "S’il explore ce que vous voulez faire reconnaître, dites-le franchement : l’effort de réalisation.",
            "Acceptez des règles de visibilité et de crédit si elles valent pour tout le monde."
          ]
        }
      }
    },

    /* ---------------- 04 ---------------- */
    {
      id: 4, num: "04", famille: "Distance et malentendus", titre: "Le conflit hybride",
      contexte: "Un collaborateur à distance estime être exclu des décisions. Les collègues sur site lui reprochent sa faible réactivité. Les messages écrits deviennent secs et les interprétations se multiplient.",
      decisions: [
        "Basculer du message écrit à l’échange oral ?",
        "Traiter les perceptions ou le processus de travail ?",
        "Quelles règles communes instaurer ?"
      ],
      reperes: [
        "Reconstituer la chronologie sans interpréter les intentions.",
        "Identifier les contraintes de disponibilité de chacun.",
        "Faire expliciter besoins d’inclusion et de réactivité.",
        "Définir canaux, délais de réponse et traces de décision."
      ],
      citation: "Les décisions sont toujours prises quand je ne suis pas connecté.",
      acteurs: {
        c1: {
          titre: "Le collaborateur à distance",
          profil: "Vous jouez le collaborateur à distance. Vous vous sentez exclu des décisions, que vous découvrez après coup. On vous reproche une faible réactivité.",
          vecu: [
            "vous êtes en visioconférence ou en déplacement une partie de la journée ;",
            "les décisions se prennent dans des échanges informels sur site ;",
            "les messages écrits que vous recevez vous semblent secs et vous répondez de la même façon."
          ],
          veut: [
            "être informé et associé aux décisions ;",
            "que vos contraintes de disponibilité soient connues ;",
            "des échanges oraux plutôt que des messages secs."
          ],
          ouverture: "Les décisions sont toujours prises quand je ne suis pas connecté.",
          jeu: [
            "Si le manager traite seulement vos « ressentis », répondez que ce sont des faits.",
            "S’il reconstitue la chronologie des échanges sans interpréter les intentions, détaillez vos disponibilités réelles.",
            "S’il fait expliciter vos besoins d’inclusion, formulez-les concrètement (invitation aux points de décision, compte rendu écrit).",
            "Acceptez des canaux, des délais de réponse et des traces de décision s’ils valent pour tout le monde."
          ]
        },
        c2: {
          titre: "Le collègue sur site",
          profil: "Vous jouez un collègue sur site, porte-parole de plusieurs collègues. Vous reprochez au collaborateur à distance sa faible réactivité : vous estimez qu’il faut sans cesse le relancer.",
          vecu: [
            "il faut le relancer plusieurs fois pour obtenir une réponse ;",
            "vous décidez entre collègues sur place pour ne pas bloquer le travail ;",
            "ses messages vous paraissent secs et vous répondez sur le même ton."
          ],
          veut: [
            "des réponses dans des délais prévisibles ;",
            "ne plus avoir à relancer ;",
            "avancer sans que le travail soit bloqué."
          ],
          ouverture: "On le relance trois fois pour une seule réponse. On ne peut pas attendre.",
          jeu: [
            "Si l’échange part sur les intentions de l’autre (« il s’en moque »), alimentez le débat.",
            "Si le manager reconstitue la chronologie sans interpréter les intentions, reconnaissez les moments où l’information n’est pas partie.",
            "S’il fait expliciter vos besoins de réactivité, donnez des délais concrets qui vous permettraient d’avancer.",
            "Acceptez des canaux, des délais de réponse et des traces de décision s’ils valent pour tout le monde."
          ]
        }
      }
    },

    /* ---------------- 05 ---------------- */
    {
      id: 5, num: "05", famille: "Équité perçue", titre: "Le planning devenu personnel",
      contexte: "Un changement de planning oppose deux collaborateurs. Chacun estime faire davantage de concessions que l’autre. Le désaccord sur les horaires se transforme en accusations de favoritisme.",
      decisions: [
        "Réviser le planning ou maintenir la décision ?",
        "Rendre visibles les critères d’arbitrage ?",
        "Traiter séparément l’équité et le comportement ?"
      ],
      reperes: [
        "Vérifier contraintes, règles et historique des concessions.",
        "Expliquer les critères sans entrer dans la justification infinie.",
        "Recadrer les attaques et reconnaître l’impact concret.",
        "Décider, documenter et prévoir une revue à date fixe."
      ],
      citation: "Comme d’habitude, c’est toujours moi qui dois m’adapter.",
      acteurs: {
        c1: {
          titre: "Le collaborateur dont le planning change",
          profil: "Vous jouez un collaborateur dont le planning vient d’être modifié. Vous estimez faire sans cesse des concessions et vous en avez assez.",
          vecu: [
            "ces derniers mois, vous avez accepté plusieurs changements d’horaires pour dépanner l’équipe ;",
            "le nouveau planning bouscule un engagement fixe en soirée ;",
            "vous avez l’impression que l’autre collaborateur est mieux traité."
          ],
          veut: [
            "que vos concessions passées soient reconnues ;",
            "comprendre les critères utilisés pour arbitrer ;",
            "un planning que vous pouvez tenir."
          ],
          ouverture: "Comme d’habitude, c’est toujours moi qui dois m’adapter.",
          jeu: [
            "Si le manager se justifie longuement, relancez les objections : « et pour lui ? ».",
            "S’il vérifie les contraintes, les règles et l’historique des concessions, donnez des exemples chiffrés.",
            "S’il explique les critères sans entrer dans une justification infinie et reconnaît l’impact concret, acceptez un ajustement raisonnable.",
            "S’il vous accuse ou minimise vos efforts, répétez l’accusation de favoritisme."
          ]
        },
        c2: {
          titre: "L’autre collaborateur concerné",
          profil: "Vous jouez l’autre collaborateur concerné par le changement de planning. Vous estimez avoir déjà fait des efforts et être accusé injustement de favoritisme.",
          vecu: [
            "vous avez vous aussi accepté des changements, que personne ne mentionne ;",
            "le nouveau planning respecte vos contraintes de transport, mais vous n’avez demandé aucune faveur ;",
            "les accusations de favoritisme vous blessent."
          ],
          veut: [
            "que les critères soient expliqués à tous ;",
            "que les accusations cessent ;",
            "que vos propres concessions soient reconnues."
          ],
          ouverture: "Moi aussi je me suis adapté, et personne ne le dit.",
          jeu: [
            "Si le manager laisse les accusations de favoritisme sans réponse, répliquez de plus en plus vivement.",
            "S’il vérifie les contraintes et l’historique des concessions de chacun, donnez votre version, sans exagérer.",
            "S’il recadre les attaques et explique les critères, apaisez-vous et acceptez le principe d’une revue à date fixe.",
            "Si le manager cède à celui qui proteste le plus fort, protestez à votre tour."
          ]
        }
      }
    },

    /* ---------------- 06 ---------------- */
    {
      id: 6, num: "06", famille: "Risque humain et RH", titre: "Le signalement de propos répétés",
      sensible: true,
      contexte: "Un collaborateur rapporte des remarques répétées qu’il juge humiliantes. Il demande au manager de « régler le problème », mais refuse pour l’instant une confrontation avec l’autre personne.",
      decisions: [
        "Quelles mesures immédiates de protection ?",
        "Que peut-on promettre sur la confidentialité ?",
        "Quand associer RH ou la hiérarchie ?"
      ],
      reperes: [
        "Écouter, dater, préciser les faits et impacts sans minimiser.",
        "Ne pas imposer une médiation immédiate.",
        "Expliquer les limites de confidentialité et tracer l’alerte.",
        "Sécuriser la situation et activer le processus interne adapté."
      ],
      citation: "Je ne veux plus me retrouver seul avec cette personne.",
      acteurs: {
        c1: {
          titre: "Le collaborateur qui signale",
          profil: "Vous jouez un collaborateur qui vient signaler des remarques répétées d’un collègue, que vous jugez humiliantes. Vous demandez au manager de « régler le problème ».",
          vecu: [
            "ces remarques reviennent régulièrement, parfois devant d’autres personnes ;",
            "vous évitez désormais certaines réunions ;",
            "vous avez peur des conséquences si cela se sait."
          ],
          veut: [
            "être cru et pris au sérieux ;",
            "ne plus être seul avec cette personne ;",
            "savoir ce qui restera confidentiel ;",
            "ne pas être confronté à elle pour l’instant."
          ],
          ouverture: "Je ne veux plus me retrouver seul avec cette personne.",
          jeu: [
            "Si le manager minimise (« ce sont des blagues »), refermez-vous.",
            "S’il propose une médiation ou une confrontation immédiate, refusez.",
            "S’il vous écoute, date et précise les faits et les impacts sans minimiser, donnez des exemples (dates, circonstances).",
            "Posez la question : « Est-ce que cela restera confidentiel ? ». Si le manager promet le secret absolu, remerciez-le. S’il explique les limites de la confidentialité et la suite possible (alerte interne), acceptez avec inquiétude mais restez dans l’échange.",
            "Acceptez des mesures de protection immédiates (par exemple ne plus être seul avec cette personne)."
          ]
        }
      }
    }
  ],

  /* ----------------------------------------------------------------------
     GRILLE D'OBSERVATION UNIVERSELLE (valable pour les six situations)
     Structurée selon le cadre de jeu : qualifier, sécuriser, choisir,
     conduire, contractualiser.
     ---------------------------------------------------------------------- */
  grille: {
    max: 5,
    amorce: "Le manager…",
    groupes: [
      { id: "qualifier", titre: "Qualifier", criteres: [
        { id: "q1", texte: "Qualifie la situation : désaccord, tension, conflit ou risque grave" },
        { id: "q2", texte: "Décide d’intervenir maintenant ou de différer, et explique pourquoi" }
      ] },
      { id: "securiser", titre: "Sécuriser", criteres: [
        { id: "s1", texte: "Sécurise si besoin : stopper, séparer, protéger, recueillir les faits" },
        { id: "s2", texte: "Évite les débats et les attaques devant les autres" }
      ] },
      { id: "choisir", titre: "Choisir", criteres: [
        { id: "c1", texte: "Choisit un format adapté (entretiens séparés, médiation, recadrage, alerte RH)" },
        { id: "c2", texte: "Explicite sa stratégie avant de conclure" }
      ] },
      { id: "conduire", titre: "Conduire", criteres: [
        { id: "d1", texte: "Fait préciser les faits" },
        { id: "d2", texte: "Fait exprimer impacts, besoins et demandes" },
        { id: "d3", texte: "Reste factuel, sans interpréter les intentions" },
        { id: "d4", texte: "Ne cherche pas de coupable et ne prend pas parti" }
      ] },
      { id: "contractualiser", titre: "Contractualiser", criteres: [
        { id: "k1", texte: "Pose une limite claire sur les comportements" },
        { id: "k2", texte: "Décide des règles, des actions et des responsables" },
        { id: "k3", texte: "Fixe un suivi daté" }
      ] }
    ]
  },

  champsObservateur: [
    { id: "faits",  label: "Faits observés marquants (ce que j’ai vu et entendu)" },
    { id: "aide",   label: "Ce qui a aidé" },
    { id: "rejeu",  label: "Séquence à rejouer en 3 minutes" }
  ]
};
