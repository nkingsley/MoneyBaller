angular.module('MoneyBaller')
  .controller('mainController', ['$scope', '$http', '$location', 'Global', 'Sliders', 'Scatter',
    'Spearman', 'Teamstar', 'Players', 'Graph', 'Graphcalc', 'promiseTracker', 'Header',
    'Coupling', 'Presets',
    function ($scope, $http, $location, Global, Sliders, Scatter, Spearman, Teamstar, Players, Graph, Graphcalc, promiseTracker, Header, Coupling, Presets) {
    $scope.players = Players;
    $scope.global = Global;
    $scope.userPresets = Presets.userPresets;
    $scope.sendScore = Presets.sendScore;
    $scope.coupling = Coupling;
    $scope.sl = Sliders;
    $scope.head = Header;
    $scope.scatter = Scatter;
    $scope.getGraphData = Graph.getGraphData;
    $scope.loadingTracker = promiseTracker('loadingTracker');
    $scope.$watch('sl.slidersCollapsed', Scatter.toggleChart);
    $scope.$watch('sl.slidersCollapsed', Graph.toggleChart);
    $scope.graphStat = "baller";
    $scope.graphEntity = null;
    $scope.graph = Graph;
    
    $scope.spearman = Spearman;
    $scope.rhoVal = 0;
    $scope.weights = Sliders.nestedSliders;


    $scope.recalculate = function(groupName){
      groupName && Sliders.changeSliders(groupName);
      Teamstar.calculateTeamStarVals($scope.teamStats,$scope.weights,$scope.teams);
      Players.startPlayerCalc(false, $scope.weights);
      if ($location.path() === '/graph'){
        $scope.getGraphData($scope.graphEntity, $scope.graphStat);
      }
      $scope.updateRho();
    };

    $scope.go = function(path){
      $scope.routes[path] = true;
      $location.path(path);
    }

    var setup = function(data,fromLocal){
      if(!fromLocal){
        if (Global.showingLastTen){
          Global.lastTenSetupHolder = angular.copy(data.teamStats);
        } else{
          Global.totalSetupHolder = angular.copy(data.teamStats);
        }
        $scope.teamStats = data.teamStats;
        Sliders.weights = angular.copy(data.cats);
        $scope.weights = Sliders.weights;
        $scope.nestedSliders = Sliders.assignNestedSliders(Sliders.weights);
      } else{
        $scope.teamStats = data;
        $scope.weights = Sliders.weights;
        $scope.nestedSliders = Sliders.assignNestedSliders(Sliders.weights);
      }
      Global.stats.then(function(stats){
        $scope.teams = stats.teams;
        $scope.presets = stats.presets;
        if ($location.path() === "/graph"){
          Global.currentTeam = "ALL";
          Players.startPlayerCalc(false, $scope.weights)
          .then(function(){
            $scope.teamsAndPlayers = Players.teamPlayers.concat($scope.teams);
          })
        }
        $scope.recalculate();
      });
    };

    $scope.updateRho = function (){
      $scope.rhoVal = $scope.spearman.rho($scope.teams);
    };

    $scope.setWeights = function(preset){
      Sliders.weights = angular.copy(preset);
      $scope.weights = Sliders.weights;
      $scope.nestedSliders = Sliders.assignNestedSliders($scope.weights);
      $scope.recalculate();
    };

    $scope.loadingTracker.addPromise(Global.stats);
    
    $scope.lastTen = function(){
      if(Global.showingLastTen){return;}
      Global.showingLastTen = true;
      Global.totalHolder = Players.allPlayers;
      Players.allPlayers = Global.lastTenHolder;
      if (Global.lastTenSetupHolder){
        setup(Global.lastTenSetupHolder,true);
      } else{
        var gp = Global.init('lt');
        gp.then(setup);
        $scope.loadingTracker.addPromise(gp);
      }
    };
    $scope.total = function(){
      if(!Global.showingLastTen){return;}
      Global.showingLastTen = false;
      Global.lastTenHolder = Players.allPlayers;
      Players.allPlayers = Global.totalHolder;
      setup(Global.totalSetupHolder,true);
    }
    $scope.makeHeadShotUrl = function(name, isCollapsed) {
      
      if(isCollapsed) { return ""; }

      var removePunctuation = function(str) {
        return str.replace(/[.']/g,'');
      };

      var url = "http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/statscube/players/large/";
      var firstLast = null;
      var formatted_name = null;

      firstLast = name.split(" ");
      for (var i = 0; i < firstLast.length; i++) {
        firstLast[i] = removePunctuation(firstLast[i]);
      }
      formatted_name = firstLast.join("_");
      return url + formatted_name.toLowerCase() + '.png';
    };

    $scope.routes = {};
    $scope.routes[$location.path()] = true;

    //kickoff process
    if (Global.showingLastTen){
      setup(Global.lastTenSetupHolder, 'local');    
    } else{
      if(Global.totalSetupHolder){
        setup(Global.totalSetupHolder, 'local');
      } else{
        Global.stats.then(setup);
      }
    }
  }]);
