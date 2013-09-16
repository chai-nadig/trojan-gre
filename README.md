<h1>Trojan-Gre</h1>
This web-app has NodeJS as its server and uses <a href="">AngularJS</a> for its front-end. The server is built using <a href="http://expressjs.com">ExpressJS</a> framework. 
It is a sample computer adaptive test. It allows for registration of student, sessions for the students to take tests and a score board at the end of the test.


<h2>How to use</h2>
1. Install <a href="http://nodejs.org">NodeJS</a>.
2. Set up mysql database
3. Run create table commands in the <a href="https://github.com/chai-nadig/trojan-gre/blob/master/trojangre.sql">trojangre.sql</a> file
4. Run the data import command in <a href="https://github.com/chai-nadig/trojan-gre/blob/master/trojangre.sql">trojangre.sql</a> to import sample questions. Ensure the path to the file is correct.
5. Configure the correct database parameters in <a href="https://github.com/chai-nadig/trojan-gre/blob/master/trojandb.js">trojandb.js</a>
6. Run <code>npm install</code> to let express download dependency modules.
7. Run <code>node server.js</code> on the terminal
7. Open <code>http://localhost:3000/</code> on the browser
