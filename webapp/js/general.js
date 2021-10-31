$(function(){
    $.getJSON('/reports', null, function(data){
        for(var i = 0; i < data.length; i++){
            $("#report-list").append('<li><a href="' + data[i].url + '" target="_blank">' + data[i].name + '</a></li>');
        }
    });

    $.getJSON('/report/latest-json-report', null, function(data){
        $("#summary-date").text(new Date(data.date).toLocaleDateString('nl-NL'));
        $("#summary").append('<li>Totaal nieuwe besmettingen: <strong>' + data.results.totalCasesSinceYesterday + '</strong></li>');
        $("#summary").append('<li>Totaal nieuwe ziekenhuisopnames: <strong>' + data.results.hospitalAdmissionsSinceYesterday + '</strong></li>');
        $("#summary").append('<li>Totaal nieuwe overleden: <strong>' + data.results.deceasedSinceYesteray + '</strong></li>');
    });
});