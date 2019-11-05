CREATE TABLE user ( 
    username VARCHAR(254) NOT NULL, 
    name VARCHAR(60) NOT NULL, 
    surname VARCHAR(60) NOT NULL, 
    email VARCHAR(254) NOT NULL, 
    password VARCHAR(254) NOT NULL, 
    PRIMARY KEY (username)
);

CREATE TABLE `like` ( 
    username VARCHAR(254) NOT NULL, 
    likeUsername VARCHAR(254) NOT NULL,
    PRIMARY KEY (username, likeUsername)    
);