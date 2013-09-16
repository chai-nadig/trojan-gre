'use strict';

function MainCtrl1 ($scope, $http,$location, $cookieStore) {

    $scope.go = function (path ) {
        $location.path( path );
        if (path == '/results') {
            $scope.navBar = $scope.resultsNavBar;
        }
    };
    $scope.resultsNavBar = [{
            route: '/results',
            text: 'Results'
        }];
    $scope.setLoggedIn = function (bool) {
        if (bool == true){
            //console.log("going to dashboard");
            $scope.go('/dashboard');
            $scope.navBar = $scope.dashboardNavBar;
        } else {
            //console.log("going to login");
            $scope.go('/login');
            $scope.navBar = $scope.loggedOutNavBar;
        }
        $scope.loggedIn = bool;
    }

    if ($cookieStore.get('regId') != null && $cookieStore.get('regId') != undefined) {
        $scope.setLoggedIn(true);
        $scope.regId = $cookieStore.get('regId');
        //console.log('cookie found');
    }

    //console.log("mainctrl1 invoked");
    $scope.navBar = $scope.loggedOutNavBar;
    $scope.loggedOutNavBar = [
    {
        route: '/login',
        text: 'Login'
    },
    {
        route: '/register',
        text:   "Register"
    }];


    $scope.dashboardNavBar = [{
        route: '/dashboard',
        text: 'Dashboard'
    }];

    $scope.logout = function() {
        $http.put('/logout').success(function(data){
            //console.log(data);
            $scope.setLoggedIn(false);
            $cookieStore.remove("regId");
            $scope.regId = null;
            //$scope.navBar = $scope.loggedOutNavBar;
            $scope.go('/login');
        }).error(function(data){
            //console.log("error logging out: "+data);
        })
    }


    $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
    };

    $scope.$watch('loggedIn',function(value) {
        //console.log("inWatch of LoggedIn: "+value);
        $scope.setLoggedIn(value);

    });
}
function ResultsCtrl($scope,$routeParams,$http,$cookieStore) {
    $scope.resultsNavBar = [{
        route: '/results',
        text: 'Results'
    }];
    $scope.navBar = $scope.resultsNavBar;

    $http.get('/results/'+$cookieStore.get('regId')).success(function(body){
        $scope.results = body;
        //console.log($scope.results);
    }). error(function(body){
        //console.log("Couldn't retrive results");
        $scope.logout();
    }) ;

}
function DashboardCtrl($scope, $routeParams,$http,$cookieStore) {
    //console.log('dashboard control invoked');
    //console.log('question: ');
    //console.dir($scope.question);

    $scope.msg = "Welcome!";


    $scope.questions = {};
    //console.log("url: /restoreSession/"+$cookieStore.get('regId')) ;
    $http.get('/restoreSession/'+$cookieStore.get('regId')).success(function(body) {
        //console.log("restoreSession - ",body);
        if (body != null && body.next_question != null && body.next_question != undefined) {
            $scope.question = body.next_question;
            $scope.qNumber = body.question_number;
            $scope.regId = body.regId;
        } else if (body.msg != undefined && body.msg!= null) {
            $scope.go('/results');
        }
        //console.log("restore session success");
        //console.dir(body);
    })  .error (function (body) {
        //console.log("Couldn't restore session!");
        $scope.logout();
    });


    $scope.submitAnswer = function () {
        //console.log($scope.regId);
        var answer = {
            qid: $scope.question.id,
            answer: $scope.choice,
            regId: $scope.regId
        }
        $http.put ('/recordAnswer', answer).success(function(body){
            //console.log("Answer submitted !");
            if (body != null && body.next_question != null && body.next_question != undefined) {
                $scope.question = body.next_question;
                $scope.qNumber = body.question_number;
                $scope.regId = body.regId;
                //console.log($scope.qNumber);
            } else if (body.msg != undefined && body.msg!= null) {
                $scope.go('/results');
            }
        }).error( function(body) {
            //console.log("Couldn't submit answer");
            $scope.logout();
        }) ;
    }
}

function LoginCtrl($scope, $routeParams, $location,$http,$cookieStore) {
    //console.log("login control invoked");
    $scope.login = function () {
        $http.post('/login', {
            regId:$scope.regId,
            password:$scope.password
            }).success(function(body){
                //alert(body);
                //console.log(body);
                $scope.setLoggedIn (true);
                $cookieStore.put('regId',body.regId);
                $scope.go('/dashboard');

            }).error(function(body){
                //console.log(body);
                //alert(body);
                $scope.setLoggedIn(false);
            })
    }
}

function RegisterCtrl($scope,$routeParams,$location,$http,$modal) {
    //console.log('register ctrl invoked');
    //console.dir($scope);
    $scope.open = function ($scope) {
        var modalInstance = $modal.open({
          templateUrl: 'registrationModal.html',
          controller: ModalInstanceCtrl,
          keyboard: false,
          backdrop:'static',
          resolve: {
            regId: function () {
                return $scope.regId;
            }

          }
        });

        modalInstance.result.then(function () {
          $scope.go('/login');
        });
      };
    var ModalInstanceCtrl = function ($scope, $modalInstance, regId) {
        $scope.regId = regId;
        //console.dir($modalInstance);
        $scope.ok = function () {
            $modalInstance.close();
        };
    };

    $scope.register = function () {
        var data = {
            emailAddr: $scope.emailAddr,
            password:  $scope.password,
            age: $scope.age,
            fullName:  $scope.fullName
        };

        var openModal = function () {
            $scope
        }

        $http.put('/registerUser',data).success(function(body) {
            //console.log(body);
            $scope.emailAddr = null;
            $scope.fullName = null;
            $scope.age = null;
            $scope.password = null;
            $scope.regId = body.regId;
            $scope.open($scope);
        }) .error(function(body){
            //console.log("error: "+body);
        });
    }
}
