'use.strict'

angular.module('trojanGRE',['ngResource','ngCookies','ui.bootstrap'])
   .config(['$routeProvider','$locationProvider',function($routeProvider, $locationProvider) {
    $routeProvider.
       when('/dashboard',{templateUrl: '/app/partials/dashboard.html', controller: DashboardCtrl}).
       when('/login',{templateUrl: '/app/partials/login.html',controller:LoginCtrl}).
       when('/register', {templateUrl: '/app/partials/register.html',controller:RegisterCtrl}).
       when('/results', {templateUrl: '/app/partials/results.html',controller:ResultsCtrl}).
       when('/aboutMe',{templateUrl: '/app/partials/about.html'}).
       otherwise({redirectTo: '/login'});

       $locationProvider.html5Mode(true)
   }]);