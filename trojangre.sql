CREATE TABLE `answers` (
  `regId` char(15) NOT NULL DEFAULT '',
  `qId` int(3) NOT NULL DEFAULT '0',
  `answer` char(100) NOT NULL,
  `answered_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `correct` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`regId`,`qId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

CREATE TABLE `questions` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `level` int(3) DEFAULT NULL,
  `question` char(100) NOT NULL,
  `answer_a` char(100) NOT NULL,
  `answer_b` char(100) NOT NULL,
  `answer_c` char(100) NOT NULL,
  `answer_d` char(100) NOT NULL,
  `correct_answer` char(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1

CREATE TABLE `student` (
  `regId` char(15) NOT NULL DEFAULT '',
  `name` char(100) NOT NULL,
  `age` int(2) NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password` char(100) NOT NULL,
  `email` char(100) NOT NULL,
  `l1` int(2) DEFAULT NULL,
  `l2` int(2) DEFAULT NULL,
  `l3` int(2) DEFAULT NULL,
  PRIMARY KEY (`regId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1

load data local infile 'path/to/DataSet_new.csv' into table questions fields terminated by "," enclosed by '"' lines terminated by '\n' (level,question,answer_a,answer_b,answer_c,answer_d,correct_answer);