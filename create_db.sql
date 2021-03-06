CREATE TABLE user ( 
    username VARCHAR(254) NOT NULL, 
    name VARCHAR(60) NOT NULL, 
    surname VARCHAR(60) NOT NULL, 
    email VARCHAR(254) NOT NULL, 
    password VARCHAR(60) NOT NULL, 
    PRIMARY KEY (username)
);

CREATE TABLE `like` ( 
    username VARCHAR(254) NOT NULL, 
    likeUsername VARCHAR(254) NOT NULL,
    PRIMARY KEY (username, likeUsername)    
);

ALTER TABLE `like`
ADD CONSTRAINT FK_username
FOREIGN KEY (username) REFERENCES user(username);


ALTER TABLE `like`
ADD CONSTRAINT FK_likeUsername
FOREIGN KEY (likeUsername) REFERENCES user(username);