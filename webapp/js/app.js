var app = angular.module('rijnmond-covid-reports', [
    'ngRoute',
    'angularMoment',
    'angular.filter'
]);

app.run(function($rootScope, $http){

});

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider.when('/', {
        title: 'main-page',
        templateUrl: '/webapp/partials/main.html',
        controller: 'MainController'
    });

}]);