app.controller('MainController', function($rootScope, $scope, $http){
    
    $http.get('/reports').then(function(data){
        $scope.reports = data.data;

    });

    $scope.getReportName = function(item){
        if(item.reportType == 'chart'){
            if(item.attributes[0].municipality){
                return 'Grafiek - ' + item.attributes[0].municipality + ' (' + item.attributes[0].daysBefore + ' dagen)';
            }

            return 'Grafiek - Regio (laatste ' + item.attributes[0].daysBefore + ' dagen)';
        }

        if(item.reportType == 'text'){
            return 'Dagelijkse statistieken';
        }

        if(item.reportType == 'average'){
            return 'Gemiddelden';
        }

        if(item.reportType == 'bulletin'){
            return 'Voorbeeld-nieuwsbericht';
        }
    }

    $scope.getReportType = function(item){
        if(item.reportType == 'chart'){
            if(item.attributes[0].municipality){
                return 'Deze grafiek geeft de trends weer voor de afgelopen ' + item.attributes[0].daysBefore + ' dagen voor de gemeente ' + item.attributes[0].municipality + '.';
            }

            return 'Deze grafiek geeft de trends weer voor de afgelopen ' + item.attributes[0].daysBefore + ' dagen.';
        }

        if(item.reportType == 'text'){
            return 'Dagelijks rapport met aantal besmettingen, aantal ziekenhuisopnames en aantal overledenen voor deze datum.';
        }

        if(item.reportType == 'average'){
            return 'Dagelijks rapport met de gemiddelde besmettingen (7-daags) van de afgelopen week.';
        }

        if(item.reportType == 'bulletin'){
            return 'Een voorbeeld nieuwsbericht met de juiste gegevens van vandaag. Let op: vul aan en kijk na!';
        }
    }

    $scope.getUrl = function(){
        if($scope.currentReport){
            return '/report/' + $scope.currentReport.uuid + '/content';
        }
    }

    $scope.setCurrent = function(report){
        $scope.currentReport = report;
    }
});