var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mysql$123',
    database: 'trojangre',
    multipleStatements:true
});

function modifyLvalues (l1, l2, l3, bool ) {
    if (bool) {
        if (l1!=null){
            if (l1 == 1) {
                l1 = null;
                l3 = null;
                l2 = 0;
            } else {
                l1 += 1;
                l2 = null;
                l3 = null;
            }
        } else if (l2 != null) {
            if (l2 == 1) {
                l2 = null;
                l1 = null;
                l3 = 0;
            } else  {
                l2 += 1;
                l1 = null;
                l3 = null;
            }
        } else if (l3 != null) {
            if (l3 <1 ) {
                l3 += 1;
                l1 = null;
                l2 = null;
            }
        }
    } else {
        if (l1 != null) {
            l1 -= 1;
            l2 = null;
            l3 = null;
        } else if (l2!= null ) {
            if (l2 == -1) {
                l2 = null;
                l3 = null;
                l1 = 0;
            } else {
                l2 -= 1;
                l1 = null;
                l3 = null;
            }
        } else if (l3 != null) {
            if (l3 == -1) {
                l3 = null;
                l1 = null;
                l2 = 0;
            } else {
                l3 -= 1;
                l1 = null;
                l2 = null;
            }
        }
    }
    return [l1,l2,l3];
}
function verifyAndRecordAnswer(list,callback) {
    var l1 = list[1],
        l2 = list[2],
        l3 = list[3],
        regId = list[0],
        qId = list[4],
        answer = list[5],
        question = null;
    pool.getConnection(function(err,connection){
        connection.query("select * from questions where id=?; select count(distinct qId) as totalAnswered from answers where regId=?",[qId,regId],function(err,results){
            if (err) {
                throw err;
            } else {
                if (results[0].length !=0 ){
                    question = results[0][0];
                    total = results[1][0].totalAnswered;
                    var correct_answer = question.correct_answer;
                    correct_answer = correct_answer.toLowerCase();
                    correct_answer = correct_answer.charAt(correct_answer.length-2);
                    correct_answer = question['answer_'+correct_answer];

                    var bool = correct_answer == answer;

                    list = modifyLvalues(l1,l2,l3,bool);
                    l1 = list[0], l2=list[1], l3=list[2];
                    connection.query("insert into answers (regId,qId,answer,correct) values (?,?,?,?);" +
                                     "update student set l1=?,l2=?,l3=? where regId=?",
                                     [regId,qId,answer,bool,l1,l2,l3,regId], function (err, results){
                        if (err) {
                            throw err;
                        } else if (total==10) {
                            var r = {
                                msg:"we're done!"
                            };
                            callback([],r) ;
                        } else {
                            restoreQuestion([regId,l1,l2,l3],callback);
                        }
                    });
                }
            }
        });
        connection.release();
    });



}
function runQuery(query, list,callback) {
    pool.getConnection(function(err,connection){
        connection.query(query,list,function(err,rows){
            if(err) {
                throw err;
            } else {
                if (callback!= null) {
                    callback(rows);
                } else {
                    return rows;
                }
            }
        });
        connection.release();
    });
}


function restoreQuestion(list, callback) {

    var l1 = list[1],
        l2 = list[2],
        l3 = list[3],
        regId = list[0];

    var lvl = -1;
    if (l1 != null && l1<=1) {
        lvl = 1;
    } else if (l2!=null && l2 >=-1 && l2<=1) {
        lvl = 2;
    } else if (l3!=null && l3>=-1) {
        lvl = 3;
    }
    pool.getConnection(function(err,connection){
        connection.query("select count(distinct qId) as totalAnswered from answers where regId=?;"+
                        "SELECT id,level,question,answer_a,answer_b,answer_c,answer_d from questions " +
                        "where level=? "+
                        "and id not in "+
                        "(select qId from answers where regId = ?) group by (level) having min(id)",[regId,lvl,regId],function(err,rows){
                            if (err) {
                                throw err;
                            } else {
                                var result;
                                if (rows[0][0].totalAnswered == 10) {
                                    result = {msg:"We're done now!"};
                                } else {
                                    result = {
                                        question_number: rows[0][0].totalAnswered+1,
                                        next_question: rows[1][0],
                                        regId: regId
                                    }
                                }

                                if(callback!=null) {
                                    callback(list,result);
                                } else {
                                    return result;
                                }
                            }
                        });
        connection.release();
    });
}
function getStudentResults(regId,callback) {
    pool.getConnection(function(err,connection) {
        connection.query("select q.level, a.correct from answers a, questions q where a.regId=? and a.qId = q.id order by a.answered_on asc;"+
                         "select q.level, count(distinct a.qId) as total  from answers a, questions q "+
                         "where a.correct=1 and a.qId = q.id and a.regId = ? group by q.level;"+
                         "select name from student where regId=?",[regId,regId,regId],function(err,rows){
                            var results = {
                                answers: rows[0]
                            };
                            var r = {};
                            for (var i in rows[1]){
                                r['level'+rows[1][i].level] = rows[1][i].total;
                            }
                            var total = 0;
                            var rating = [10,20,30];
                            for( var i =1; i <=3;i++) {
                                if (r['level'+i] != undefined && r['level'+i] != null) {
                                    total  += (r['level'+i]*rating[i-1]);
                                }
                            }
                            results['total'] = total;
                            results['regId'] = regId;
                            results['name'] = rows[2][0].name;
                            callback(results);
                         }) ;
    })
}


module.exports.getStudentResults = getStudentResults
module.exports.runQuery = runQuery
module.exports.restoreQuestion = restoreQuestion
module.exports.verifyAndRecordAnswer = verifyAndRecordAnswer

