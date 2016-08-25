/**
* Les evenements et directives sous AngularJS
*/

/*
*  Application "Carnet d'Adresses"

  + Créer un tableau de 8 utilisateurs avec nom, prénom, age, photo, date de naissances(dd/mm/YYYY),noteBac (de 1 à 20), sexe(boolean), ville (Paris ou Lyon ou Marseille), biographie, langue(fr,en,it ou es),
	+ Afficher tous ces utilisateurs et leurs informations dans des Collections sous Materialize (http://materializecss.com/collections.html)
  + Afficher le nombre d'utilisateur ainsi que la moyenne d'age des utilisateurs
  + Afficher à coté du nombre utilisateurs le mot "utilisateurs" avec un "s" ou pas avec la directive "ng-show"
  + Afficher le mots "Il y a que des mineurs" si la moyenne est inférieur à 18 ans avec la directive "ng-show" ou "ng-if"
  + Créer un bouton "remove" à chaque utilisateur permettant au click de supprimer l'utilisateur
  + Créer des boutons radios Lyon Paris Marseille pour filtrer les utilisateur au click de ces bouttons radios
  + Créer des radios de tranches d'age permettantd de filtrer par age les utilisateurs incluant les tranches de prix suivantes: -10, 10-18, 18-30 , 30-45 , + de 45
   Bonus: Les checkbox de tranches d'age prendra en compte le 1ere filtre sur lesboutons radios
  + Créer un Datepicker pour filtrer par date de naissances les utilisateurs à partir de cette date : avec Materializecss http://materializecss.com/forms.html#date-picker
  + Créer un input range pour filtrer selon la note au bac de 1 à 20 avec Materialize http://materializecss.com/forms.html#range
  + Créer un formulaire d'ajout d'utilisateurs avec l'ensemble de ces données (on fera la validation plus tard, vous piuvez prendre de l'avance et voir comment on valide un formulaire sous ANgular ici https://openclassrooms.com/courses/validation-de-formulaire-simplifiee-avec-angularjs)
  + Bonus: Externaliser les users dans un fichier json et chargé ce fichier en AJAX à l'aide de l'opérateur $http
  +

  Lien: http://www.tutoriel-angularjs.fr/tutoriel/2-utilisation-complete-d-angularjs/2-les-filtres
  // Tuto Moment: http://www.lafermeduweb.net/billet/moment-js-manipuler-les-dates-javascript-simplement-1246.html

*/



/**
* Déclaration de l'application
*/
var carnetAdressesApp = angular.module('carnetAdressesApp', []);


/**
* Filtres
*/
// filtre pour trier par tranches d'ages
carnetAdressesApp.filter('range',function(){

  return function(tableau, tranches) {
    tranches = _.filter(tranches, function(elt){
       return elt.checked === true;
    });

    if (tranches.length === 0){
      return tableau;
    }

    var tableauFilter = [];

    for (tranche of tranches) {

      if (tranche.data == "-10") {
        tableauFilter.push(_.filter(tableau, function(elt){
          return elt.age < 10;
        }));
      }
      if (tranche.data == "10-18") {
        tableauFilter.push(_.filter(tableau, function(elt){
          return elt.age >= 10 && elt.age <= 18;
        }));
      }
      if (tranche.data == "18-30") {
        tableauFilter.push(_.filter(tableau, function(elt){
          return elt.age >= 18 && elt.age <= 30;
        }));
      }
      if (tranche.data == "30-45") {
        tableauFilter.push(_.filter(tableau, function(elt){
          return elt.age >= 30 && elt.age <= 45;
        }));
      }
      if (tranche.data == "+45") {
        tableauFilter.push(_.filter(tableau, function(elt){
          return elt.age > 45;
        }));
      }
    }

    fusionAges = [];
    fusionAges = [].concat.apply([], tableauFilter);
    // console.log(fusionAges);

    return fusionAges;

  };

});


// filtre pour trier par date de naissance
carnetAdressesApp.filter('naissance',function(){
  return function(tableau, date){
    if(date === undefined || date === null){
      return tableau;
    }

    return  _.filter(tableau, function(utilisateur){
      return moment(utilisateur.dateNaissance,'DD/MM/YYYY') > moment(date);
    });

  };
});


// filtre pour trier par note du bac
carnetAdressesApp.filter('notes',function(){
  return function(tableau, note){
    if (note === undefined || note === null){
      return tableau;
    }
    return  _.filter(tableau, function(utilisateur){
      return utilisateur.noteBac >= note;
    });
  };
});


// filtre qui ajoute un drapeau selon la langue de l'utilisateur
carnetAdressesApp.filter('drapeaux',function(){
  return function(langue){
    if (langue == 'fr') {
      return "http://www.marie-paris.fr/img/cms/drapeau.png";
    }
    else if (langue == 'en') {
      return "http://www.raquettesvaldisere.com/img/drapeau-en.png";
    }
    else if (langue == 'it') {
      return "https://www.chalet-montagne.com/bundles/chaletmontagnefront/images/location/drapeau_IT_.jpg";
    }
    else if (langue == 'es') {
      return "http://projetbabel.org/forum/images/smiles/icon_esp.gif";
    }
  };
});


// filtre pour trier par majorité via bouton "switch"
carnetAdressesApp.filter('majorite',function(){

  return function (input, checked) {

    if(input === undefined){
      return input;
    }

    var mineur = [];
    var majeur = [];

    for (utilisateur of input) {
      if (utilisateur.age >= 18) {
        majeur.push(utilisateur);
      }
      else {
        mineur.push(utilisateur);
      }
    }

    // si le switch est checké ou non
    if (checked === undefined || checked === false){
      checked = true; // variable drapeau (flag)
      return mineur;
    }
    else {
      checked = false;
      return majeur;
    }

  };
});




// filtre pour effectuer une recherce par nom ou prénom
// (également possible sans filtre mais directement via ng-model="search.nom" ou ng-model="search.prenom" mais la recherche sera seulement par nom OU par prenom et non pas par nom ET prénom comme demandé).

// carnetAdressesApp.filter('search',function(){
//   return function(tableau, PrenomNom){
//     if(PrenomNom === undefined || PrenomNom === false){
//       return tableau;
//     }
//
//     return  _.filter(tableau, function(utilisateur){
//       if (utilisateur.prenom == PrenomNom || utilisateur.nom == PrenomNom) {
//         return utilisateur;
//       }
//     });
//
//   };
//
// });















/**
* Controller
*/
carnetAdressesApp.controller('MainCtrl', ['$scope','$http', function($scope, $http){

  var nbrUsers = 0;

  // $scope.carnetAdresses = [
  //   {
  //     id : 1,
  //     nom : 'MARTIN',
  //     prenom : 'Enzo',
  //     age : 17,
  //     photo : 'http://www.coupecheveuxhomme.com/wp-content/uploads/2014/10/garcon-de-15-ans-swag.jpg',
  //     dateNaissance : '19/01/1999',
  //     noteBac : 9,
  //     sexe : true,
  //     codepostal : 75000,
  //     ville : 'Paris',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'fr',
  //   },
  //
  //   {
  //     id : 2,
  //     nom : 'PETIT',
  //     prenom : 'Jules',
  //     age : 35,
  //     photo : 'http://static1.purepeople.com/articles/4/27/65/4/@/189578-simon-taglioni-beau-garcon-et-frere-950x0-1.jpg',
  //     dateNaissance : '04/08/1981',
  //     noteBac : 15,
  //     sexe : true,
  //     codepostal : 69000,
  //     ville : 'Lyon',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'en',
  //   },
  //
  //   {
  //     id : 3,
  //     nom : 'DURAND',
  //     prenom : 'Thomas',
  //     age : 40,
  //     photo : 'http://l.yimg.com/bt/api/res/1.2/CK.Z5odJ26Bf_qQKbYStig--/YXBwaWQ9eW5ld3NfbGVnbztpbD1wbGFuZTtxPTc1O3c9NjAw/http://media.zenfs.com/en/person/Ysports/pierre-garcon-football-headshot-photo.jpg',
  //     dateNaissance : '26/03/1976' ,
  //     noteBac : 13,
  //     sexe : true,
  //     codepostal : 13000,
  //     ville : 'Marseille',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'it',
  //   },
  //
  //   {
  //     id : 4,
  //     nom : 'DUBOIS',
  //     prenom : 'Tom',
  //     age : 22,
  //     photo : 'http://www.filsantejeunes.com/images/coupe-garcon.jpg',
  //     dateNaissance : '26/12/1994',
  //     noteBac : 08,
  //     sexe : true,
  //     codepostal : 75000,
  //     ville : 'Paris',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'es',
  //   },
  //
  //   {
  //     id : 5,
  //     nom : 'BEN KALIFA',
  //     prenom : 'Nawel',
  //     age : 31,
  //     photo : 'http://www.marieclaire.fr/data/photo/w652_h382_c1/160/femem-saoudienne.jpg',
  //     dateNaissance : '04/04/1985',
  //     noteBac : 16,
  //     sexe : false,
  //     codepostal : 69000,
  //     ville : 'Lyon',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'fr',
  //   },
  //
  //   {
  //     id : 6,
  //     nom : 'LEROY',
  //     prenom : 'Jade',
  //     age : 25,
  //     photo : 'http://www.snut.fr/wp-content/uploads/2015/07/image-de-femme-9.jpg',
  //     dateNaissance : '18/09/1991',
  //     noteBac : 18,
  //     sexe : false,
  //     codepostal : 13000,
  //     ville : 'Marseille',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'en',
  //   },
  //
  //   {
  //     id : 7,
  //     nom : 'MOREL',
  //     prenom : 'Judith',
  //     age : 28,
  //     photo : 'https://pixabay.com/static/uploads/photo/2015/12/29/11/38/girl-1112648_960_720.jpg',
  //     dateNaissance : '19/10/1988',
  //     noteBac : 12,
  //     sexe : false,
  //     codepostal : 75000,
  //     ville : 'Paris',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'it',
  //   },
  //
  //   {
  //     id : 8,
  //     nom : 'FOURNIER',
  //     prenom : 'Vanessa',
  //     age : 45,
  //     photo : 'http://static.lexpress.fr/medias_10878/w_2048,h_1146,c_crop,x_0,y_0/w_1520,h_855,c_fill,g_north/v1458730813/ivanka-trump-ici-en-2015-femme-d-affaire-redoutable-et-mere-de-famille_5569651.jpg',
  //     dateNaissance : '18/06/1971',
  //     noteBac : 17,
  //     sexe : false,
  //     codepostal : 69000,
  //     ville : 'Lyon',
  //     biographie : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  //     langue : 'es',
  //   },
  // ];


  // requete HTTP en GET (via l'url)
  // pour récuperre mon tableau en JSON formate (https://jsonblob.com/)
  // 57ab3f94e4b0dc55a4ebdce3: identifiant de sauvegarde
  $http.get('https://jsonblob.com/api/57ab3f94e4b0dc55a4ebdce3').success(function(response) { //reponse: contenu récupéré depuis l'url
    $scope.carnetAdresses = carnetAdresses = response; //j'enregistre dans ma scope mes utilisateurs
    $scope.sexe();
    $scope.moyenneAge();
    $scope.utilisateursMajeur();
    nbrUsers = $scope.carnetAdresses.length;
  });




  // Affichage du sexe (via boolean)
  $scope.sexe = function () {
    if ($scope.carnetAdresses.sexe === true) {
      return 'Homme';
    }
    return 'Femme';
  };



  // Calcul Moyenne Age
  $scope.moyenneAge = function () {

    if($scope.carnetAdresses === undefined){
      return 0;
    }

    var sommeAge = 0;
    var moyAge = 0;

    for (utilisateur of $scope.carnetAdresses) {
      sommeAge +=  utilisateur.age;
    }
    // calcul de la moyenne (sommeAge / par la longeur du tableau ou le nbr d'utilisateurs)
    moyAge = sommeAge / $scope.carnetAdresses.length;
    return moyAge.toFixed(); // toFixed() pour arrondi à l'entier supérieur
  };



  // Afficher "Il y a que des majeurs" si il y a uniquement que des majeurs "ng-show" ou "ng-if" (._every)
  $scope.utilisateursMajeur = function () {
    return _.every($scope.carnetAdresses, function(num) {
      return num.age >= 18;
    });
  };



  // Créer un bouton "remove" à chaque utilisateur permettant au click de supprimer l'utilisateur
  $scope.removeUtilisateur = function (utilisateur) {
    // indexOf permet de récuperer la position d'un élément dans le tableau
    var indexUtilisateur = $scope.carnetAdresses.indexOf(utilisateur);
    // splice va supprimer 1 élément selon une position (",1" pour cibler 1 élément)
    $scope.carnetAdresses.splice(indexUtilisateur, 1);
  };



  // Créer des checkbox de tranches d'age permettant de filtrer par age les utilisateurs incluant les tranches d'ages suivantes: -10, 10-18, 18-30 , 30-45 , + de 45

  //init tranches
  $scope.tranches = [
      {"data": "-10", "checked" : false},
      {"data": "10-18", "checked" : false},
      {"data": "18-30", "checked" : false},
      {"data": "30-45", "checked" : false},
      {"data": "+45", "checked" : false},
  ];
  // + création d'un filter "range" (voir plus haut)






  // Créer un input date Datepicker pour filtrer par date de naissances les utilisateurs à partir de cette date (utiliser "moment" si possible )
  // Tuto Moment: http://www.lafermeduweb.net/billet/moment-js-manipuler-les-dates-javascript-simplement-1246.html

  // voir filtre "naissance" plus haut





  // Créer un input range pour filtrer selon la note au bac de 1 à 20 avec Materialize http://materializecss.com/forms.html#range

  // voir filtre "notes" plus haut





  // Créer un formulaire d'ajout d'utilisateurs avec l'ensemble de ces données (on fera la validation plus tard, vous pouvez prendre de l'avance et voir comment on valide un formulaire sous ANgular ici https://openclassrooms.com/courses/validation-de-formulaire-simplifiee-avec-angularjs)

  // Initialisation MaterializeCSS pour afficher certains éléments du formulaire (!!!! attention les "select" ne focntionne plus obligé de le "désactiver" comme ci-dessous !!!! )
  $(document).ready(function() {
    // $('select').material_select();
    // $('select#ville').material_select();
    // $('select#langue').material_select();
  });


  $scope.add = function(){

    nbrUsers++;

    $scope.carnetAdresses.push({
      id: nbrUsers,
      nom: $scope.nom,
      prenom: $scope.prenom,
      age: parseInt($scope.age),
      photo: $scope.photo,
      dateNaissance: $scope.dateNaissance,
      noteBac: parseInt($scope.noteBac),
      sexe: $scope.sexe,
      ville: $scope.ville,
      biographie: $scope.biographie,
      langue: $scope.langue,
    });
    // remettre les champs saisies à blanc
    $scope.nom =  $scope.sexe = $scope.ville =  $scope.biographie = $scope.prenom = $scope.age = $scope.photo = $scope.langue = $scope.dateNaissance = $scope.noteBac = "";
  };





  /**
  *  Application "Carnet d'Adresses" Partie 2
  */

  /**
		+ Cacher les cards des users quand il y en a pas et y mettre un petite message en rouge: Aucun utilisateurs trouvé :( (attention aux filtres!!)
    + Ajouter 1 classe css "warning" si l'utilisateur n'a pas eu la moyenne au bac: Directive "ng-class"
    + Créer un filtre qui selon la langue affiche le drapeau du pays pour chaque utilisateurs
		+ Créer un bouton Switch permettant de filtrer les utilisateurs majeurs ou les utilisateurs mineurs
   	+ Créer un moteur de recherche instantanée de recherche de d'utilisateurs
   	+ Ajouter aux utilisateurs le code postal
    + Ajouter un champ département permettant de filtrer les utilisateurs par départements
    + Bonus : Afficher le nom du département juste en dessus des utilisateurs à chaque changement de département filtré
    + AJouter un icon "access_time" a coté de chaque utilisateur si ce mois courant est le mois d'anniversaire de l'utilisateur <i class="material-icons">access_time</i> (utiliser moment)
    + CRéer une liste déroulante me permettant de trier par nom, par prénom, par age, par note au bac ou par ville
    + Créer une notification (Toast) quand un utilisateurs se crée http://materializecss.com/dialogs.html#toast
    + Ajouter des id "1", "2" , "3" etc... à chaque utilisateurs.

    + Créer un bouton "like" sur chacun utilisateur qui permet de le mémoriser avec la session locale du navigateur sessionStorage par leur id http://www.alsacreations.com/article/lire/1402-web-storage-localstorage-sessionstorage.html
     + Créer une petite liste des utilisteurs mise en mémoire restituer dès le chargement des elements par la session du naviguateur (whishliste)
     + Créer un bouton "+1" qui permet d'ajouter un "+1" à un utilisateur et l'état du bouton change à un icon "check"
     Le  stockage du +1 sera en session local storage du naviguateur

     + Indice:  utiliser les fonctions JSON.parse() et JSON stringify() :)

  -*/


  //  + Ajouter 1 classe css "warning" si l'utilisateur n'a pas eu la moyenne au bac: Directive "ng-class"
  //
  // voir directement dans le HTML  - utilisé une ng-class "red" car MaterializeCSS ne prends pas les class "warning - success etc..."




  // + Créer un filtre qui selon la langue affiche le drapeau du pays pour chaque utilisateurs
  // voir filtre "naissance" plus haut




  // + Créer un filtre qui selon la langue affiche le drapeau du pays pour chaque utilisateurs
  // voir filtre "drapeaux" plus haut




  // + Créer un bouton Switch permettant de filtrer les utilisateurs majeurs ou les utilisateurs mineurs
  // voir filtre "majorite" plus haut




  // + Créer un moteur de recherche instantanée de recherche de d'utilisateurs sur le nom et le prénom
  // voir filtre "search" plus haut


  // + Ajouter un champ département permettant de filtrer les utilisateurs par départements
  // voir HTML (ng-model="departement.codepostal")


  // + Bonus : Afficher le nom du département juste en dessus des utilisateurs à chaque changement de département filtré
  // $scope.visuDepartement = function () {
  //
  //   for (utilisateur of $scope.carnetAdresses) {
  //     if (utilisateur.codepostal == 69000) {
  //       return Rhônes;
  //     }
  //     else if (utilisateur.codepostal == 75000) {
  //         return Paris;
  //     }
  //     else if (utilisateur.codepostal == 13000) {
  //       return "Bouches du Rhônes";
  //     }
  //   }
  // };



  // + Ajouter un icon (Material Icons) a coté de chaque utilisateur si ce mois courant est le mois d'anniversaire de l'utilisateur (utiliser moment)
  $scope.anniversaire = function(utilisateur) {

      // création d'une variable via "moment" qui va récupérer le mois actuel
      var currentMonth = new Date().getMonth()+1;

      // console.log(currentMonth);
      // console.log(utilisateur.dateNaissance.substr(3, 2));

      // substr (3, 2) pour cibler seulement le mois de naissance des utilisateurs jj/mm/aaa
      if (parseInt(utilisateur.dateNaissance.substr(3, 2)) == currentMonth) {
        return true;
      }
      else {
        return false;
      }
  };



  // + Créer une liste déroulante me permettant de trier (croissant ou décroissant) par nom, par prénom, par age, par note au bac ou par ville
  // voir HTML





  //  + Créer une notification (Toast) quand un utilisateurs se crée http://materializecss.com/dialogs.html#toast
  // voir HTML - au niveau du bouton de création utilisateur




  // + Créer un bouton "like" sur chacun des utilisateurs qui permet de le mémoriser avec la session locale du navigateur sessionStorage par leur id (1, 2, 3 etc....) http://www.alsacreations.com/article/lire/1402-web-storage-localstorage-sessionstorage.html



  $scope.estDedans = function (identifiant) {
    $scope.lesLikes = _.uniq($scope.lesLikes); // enlève les doublons

    if ($scope.lesLikes.indexOf(identifiant) != -1) {
      // console.log('Dans le if de estDedans(identifiant)');
      // console.log("lesLikes APRÈS traitement : " + $scope.lesLikes);
      return true;
    }
    // console.log("les Likes APRÈS traitement : " + $scope.lesLikes);
    return false;
  };

  $scope.addLikeOrRemove = function (user) {
    if (user === undefined) {
      return true;
    }
    // console.log($scope.estDedans(user.id));

    if ($scope.estDedans(user.id)) {
      var indiceDansLesLikes = $scope.lesLikes.indexOf(user.id);
      // console.log(indiceDansLesLikes);
      $scope.lesLikes.splice(indiceDansLesLikes, 1);
    }
    else {
      $scope.lesLikes.push(user.id);

    }
    // JSON.stringify et JSON.parse nécessaire pour la sessionStorage
    sessionStorage.lesLikes = JSON.stringify($scope.lesLikes);
    $scope.lesLikes = JSON.parse(sessionStorage.lesLikes);
  };


  //  Détection du support (Stockage en session = sessionStorage)
  if(typeof sessionStorage != 'undefined') {
    $scope.save = sessionStorage.getItem('lesLikes');
    $scope.lesLikes = [];
    // regex pour ne garder que des chiffres
    var regex = new RegExp("[0-9]+", "igm");

    if (sessionStorage.lesLikes != null) {

      for (nbr of $scope.save) {
        if (regex.test(nbr)) {
          nbr = parseInt(nbr);
          $scope.lesLikes.push(nbr);
        }
        else {
        // console.log("caractère non conforme");
        }
        // console.log(nbr);
      }
    }
    else {
      $scope.lesLikes = [];
    }
    // console.log($scope.lesLikes);
  }






  // + Créer une petite liste des utilisateurs mise en mémoire restituer dès le chargement des éléments par la session du naviguateur (whishliste)

  $scope.fav = [];

  $scope.favoris = function () {
    if ($scope.save.indexOf(utilisateur.id) != -1) {
      $scope.fav.push(utilisateur);
    }
    console.log($scope.fav);
  };


  // !!!!!!!!!! Correction Damien !!!!!!!!!!
  // <button type="button" class="btn-floating btn-large waves-effect waves-light transparent dropdown-button material-icons" data-activates="dropdown1" ng-click="actualiseWishList()" ng-model="master">shopping_cart</button>
  // <ul id="dropdown1" class="collection dropdown-content">
  //   <li ng-if="verifWishList() == true"><span class="title">{{ nombreDansPanier() }} favoris dans le panier</span></li>
  //   <li class="collection-item avatar" ng-repeat="user in master">
  //   <img ng-src="{{user.photo}}" alt="Photo de {{user.prenom}} {{user.nom}}" class="circle">
  //   <span class="title">{{user.prenom}} {{user.nom}}</span>
  //   <button class="secondary-content btn-floating btn-large waves-effect waves-light red material-icons" type="button" name="suppression" ng-click="likeUser(user)">delete</button>
  //   </li>
  //   <li ng-if="verifWishList() == false">
  //   <span class="title">Cliquez sur les <button class="btn-floating btn-large waves-effect waves-light pink material-icons" type="button" name="like">stars</button> pour ajouter au panier !</span>
  //   </li>
  //   <li ng-if="verifWishList() == true">
  //   <button class="btn-floating btn-large btn-notif waves-effect waves-light red material-icons" type="button" name="suppression" ng-click="deleteWishList()">delete_sweep</button>
  //   </li>
  // </ul>
  //
  //
  // $scope.actualiseWishList = function() {
  //       $scope.master = JSON.parse(sessionStorage.getItem("wishList"));
  // };
  //
  // $scope.verifWishList = function() {
  //   var tab = [];
  //
  //   if (JSON.parse(sessionStorage.getItem("wishList")) === null || JSON.parse(sessionStorage.getItem("wishList")).length === tab.length) {
  //     return false;
  //   }
  //   else {
  //     return true;
  //   }
  // };











  // + Créer un bouton "+1" qui permet d'ajouter un "+1" à un utilisateur + Le stockage du +1 sera en session local storage du naviguateur

  // autre possiblité directement dans le HTML (ng-click="count = count + 1")

  $scope.count = 0;
  function countPlusUn(newVal, oldVal, scope) {
  }

  $scope.addone = function(){
    $scope.count++;
  };

  $scope.$watch('count', countPlusUn, true);





  // !!!! Correction Damien !!!!!!
  // $scope.addPlusUn = function(object) {
  //
  // var liste = [];
  // // variable utilisé pour savoir si on a ajouté un +1 à quelqu'un ou non
  // var drapeau = false;
  //
  // // si la session n'est pas nulle on récup la liste en session storage
  // if (sessionStorage.getItem("plusUn") !== null) {
  //   liste = JSON.parse(sessionStorage.getItem("plusUn")); // traduire une chaine en tableau JS
  // }
  //
  // // parcours des utilisateur de la liste récup de la session storage
  // for (user of liste) {
  //   // si un user id correspond à celui sur lequel on a cliqué, on lui rajoute un +1
  //   if (object.id === user.id) {
  //     user.plus++;
  //     drapeau = true;
  //   }
  // }
  //
  // // si user non trouvé, on le rajoute dans la liste (qui ira dans la session storage)
  // if (drapeau !== true) {
  //   liste.push({ id: object.id, plus: 1 });
  // }
  //
	// //on met la liste en session storage
  // sessionStorage.setItem("plusUn",JSON.stringify(liste));  // JSON.stringify != JSON.parse
  // };
  //
  //
  // /**
  // * FONCTION PERMETTANT DE SAVOIR SI USER POSSEDE OU NON UN +1
  // * Changer un boutin detat
  // */
  // $scope.possedePlusUn = function(object) {
  //   var tab = [];
  //   var liste = JSON.parse(sessionStorage.getItem("plusUn"));
  //   var userId = object.id;
  //
  //   if (liste === null || liste.length === tab.length) {
  //     return false;
  //   }
  //
  //   else {
  //     for (user of liste) {
  //       if (userId == user.id) {
  //         return true;
  //       }
  //     }
  //     return false;
  //   }
  // };
  //
  // $scope.qttPlusUn = function(object) {
  //
  //   var liste = JSON.parse(sessionStorage.getItem("plusUn"));
  //   var userId = object.id;
  //
  //   for (user of liste) {
  //     if (userId == user.id) {
  //       return user.plus;
  //     }
  //   }
  // };
  //
  // // H T M L
  //
  // <button class="btn-floating btn-large btn-option waves-effect waves-light indigo" type="button" name="plusUn" ng-click="addPlusUn(user)">
  // <span ng-if="possedePlusUn(user)===true">+ {{ qttPlusUn(user) }}</span>
  // <span class="material-icons " ng-if="possedePlusUn(user)===false">add</span>
  // </button>
























  /**
  * Exercice 5 Carnet D'Adresse Partie 3 (Maitrise de Module Installer et Environement)
  *

  + Créer un bouton permettant de vider le panier des favoris des utilisateurs
  + Créer un bouton dans le panier permettant de supprimer un item du panier des favoris
  + Affiher le nombre d'element dans le panier
  + Créer une liste déroulante qui permettra d'afficher 5 / 10 / 15 / 20 utilisateurs
  + Initialiser une note à 0 pour tous les utilisateurs
  + Installer ng-stats pour mesurer les stats de watchers dans votre application https://github.com/kentcdodds/ng-stats
  + AJout d'un module avec Bower: Ajouter à l'application le module Angular Load bar disponible ici http://chieffancypants.github.io/angular-loading-bar/
  + Ajout d'un module avec Bower: Ajouter à lapplication des animations de transitions sur els card avec angular-animate https://docs.angularjs.org/api/ngAnimate
  + Ajout d'un module sous angular: Ajouter la possibilité de noter de 0 à 5 les utilisateurs avec le module Angular Input Star disponible sous bower ici https://github.com/melloc01/angular-input-stars
  + Ajouter 5 commentaires par utilisateurs avec pour chaque commentaires le contenu et la date
  + Afficher le nb. de commentaires sur notre liste d'utilisateurs et un bouton "Voir les commentaires"  où quand je clique sur ce bouton, nous affichons une modal qui affiche les commentaires de cet tilisateur
  + Créer un nouvelle page petrmettant de visualiser le détail d'un utilisateur quand je clique sur sa loupe.
    Pour cela, je vous conseille de regarder ce liens vers le systeme de route et parametres dans la route http://www.tutoriel-angularjs.fr/tutoriel/2-utilisation-complete-d-angularjs/1-le-routage
  + Créer une nouvelle page permettant de visualiser des commentaires de la série GOT derriere l'URL https://jsonplaceholder.typicode.com/comments
  + Bonus: Créer une formulaire perettant l'ajout des commentaires en POST ($http.post) derriere l'url https://jsonplaceholder.typicode.com/comments
  + Bonus 2: Permettre à l'utilisateur de de supprimer un commentaire

  */



  // + Créer un bouton permettant de vider le panier des favoris des utilisateurs



  //  + Créer un bouton dans le panier permettant de supprimer un item du panier des favoris


  // <button class="secondary-content btn-floating btn-large waves-effect waves-light red material-icons" type="button" name="suppression" ng-click="likeUser(user)">delete</button>











































}]);
