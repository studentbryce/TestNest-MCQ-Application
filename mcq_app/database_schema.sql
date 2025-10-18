-- Complete Database Schema for TestNest MCQ Application
-- Role-based authentication with students and tutors
-- Integer-based answer system (1-4 for choices)

-- Users table with role-based support
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY, -- Auto-incrementing primary key for all users
    StudentID INTEGER UNIQUE CHECK (StudentID >= 1000000 AND StudentID <= 99999999), -- 7-8 digit constraint, required for students only
    FirstName VARCHAR(256) NOT NULL,
    LastName VARCHAR(256) NOT NULL,
    UserName VARCHAR(256) UNIQUE NOT NULL,
    Password VARCHAR(64) NOT NULL, -- SHA256 HASH
    Role VARCHAR(20) DEFAULT 'student' CHECK (Role IN ('student', 'tutor')),
    TutorID VARCHAR(10) UNIQUE, -- For tutors only, format: TUT1234
    Department VARCHAR(100), -- For tutors only
    -- Constraint: Students must have StudentID, tutors must have TutorID
    CONSTRAINT check_role_requirements CHECK (
        (Role = 'student' AND StudentID IS NOT NULL AND TutorID IS NULL) OR
        (Role = 'tutor' AND TutorID IS NOT NULL)
    )
);

-- Questions table with integer answers
CREATE TABLE Questions (
    QuestionID SERIAL PRIMARY KEY,
    Question TEXT NOT NULL,
    Choice1 VARCHAR(256) NOT NULL,
    Choice2 VARCHAR(256) NOT NULL,
    Choice3 VARCHAR(256),
    Choice4 VARCHAR(256),
    Answer INTEGER NOT NULL CHECK (Answer >= 1 AND Answer <= 4) -- 1=Choice1, 2=Choice2, 3=Choice3, 4=Choice4
);

-- Tests table
CREATE TABLE Tests (
    TestID SERIAL PRIMARY KEY,
    TestTitle VARCHAR(256) NOT NULL,
    TimeLimit INTEGER NOT NULL,
    TestDescription TEXT
);

-- TestQuestions junction table
CREATE TABLE TestQuestions (
    TestID INTEGER,
    QuestionID INTEGER,
    PRIMARY KEY (TestID, QuestionID),
    FOREIGN KEY (TestID) REFERENCES Tests(TestID) ON DELETE CASCADE, -- if test is deleted, delete questions from one-to-many table
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE -- if question is deleted, delete from TestQuestions table
);

-- Results table with integer answers
CREATE TABLE Results (
    ResultID SERIAL PRIMARY KEY,
    StudentID INTEGER NOT NULL CHECK (StudentID >= 1000000 AND StudentID <= 99999999), -- 7-8 digit constraint
    TestID INTEGER NOT NULL,
    QuestionID INTEGER NOT NULL,
    GivenAnswer INTEGER NOT NULL CHECK (GivenAnswer >= 1 AND GivenAnswer <= 4), -- 1=Choice1, 2=Choice2, 3=Choice3, 4=Choice4
    FOREIGN KEY (StudentID) REFERENCES Users(StudentID) ON DELETE CASCADE, -- if user is deleted, delete results
    FOREIGN KEY (TestID) REFERENCES Tests(TestID) ON DELETE CASCADE, -- if test is deleted, delete results
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID) ON DELETE CASCADE -- if question is deleted, delete results
);

-- Add indexes for better performance
CREATE INDEX idx_users_username ON Users(UserName);
CREATE INDEX idx_users_studentid ON Users(StudentID);
CREATE INDEX idx_users_tutorid ON Users(TutorID);
CREATE INDEX idx_users_role ON Users(Role);
CREATE INDEX idx_results_student ON Results(StudentID);
CREATE INDEX idx_results_test ON Results(TestID);
CREATE INDEX idx_testquestions_test ON TestQuestions(TestID);
CREATE INDEX idx_testquestions_question ON TestQuestions(QuestionID);

-- Sample data with corrected integer answers
-- Insert into Users table (students and tutors)
INSERT INTO Users (StudentID, FirstName, LastName, UserName, Password, Role) VALUES 
(12345678, 'Automation', 'Test', 'autotest', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'student'),
(9913033, 'Bryce', 'Milbank', 'brycerm', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'student'),
(10013661, 'Peter', 'Kim', 'peterrabbit', '6385338e394435c52c9dcc79a437cef85b3b55baf7d7793d3b4e1d73cbacfd8b', 'student'),
(10005332, 'Avneet', 'Singh', 'avneet55', 'd2483e12bdeb1c7b3c02ceea638fa4f1931b2cd9aad058d2d36ec3bb3671f791', 'student');

-- Add sample tutors (UserID will be auto-generated, StudentID is NULL for tutors)
INSERT INTO Users (FirstName, LastName, UserName, Password, Role, TutorID, Department) VALUES 
('Dr. Sarah', 'Johnson', 'sarah.johnson@university.edu', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'tutor', 'TUT1001', 'Computer Science'),
('Prof. Michael', 'Chen', 'michael.chen@university.edu', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'tutor', 'TUT1002', 'Mathematics'),
('Dr. Emily', 'Davis', 'emily.davis@university.edu', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'tutor', 'TUT1003', 'Computer Science');

-- Insert into Questions table (Answer column uses integers 1-4)
INSERT INTO Questions (Question, Choice1, Choice2, Choice3, Choice4, Answer) VALUES 
('Which of the following is a mutable data type in Python?', 'int', 'float', 'list', 'tuple', 3),
('What is the data type of ''True'' in Python?', 'int', 'bool', 'str', 'float', 2),
('Which of these is not a standard Python data type?', 'dictionary', 'matrix', 'set', 'string', 2),
('What does the following code output? print(type(10.0))', 'int', 'float', 'double', 'complex', 2),
('In Python, what is the result of type(''3'') == type(3)?', 'True', 'False', 'None', 'Error', 2),
('Which data type is best for storing the number of items in stock?', 'int', 'float', 'str', 'bool', 1),
('How would you correctly declare a variable named total_cost with an initial integer value of 500?', 'int total_cost = 500', 'var total_cost = 500', 'total_cost = 500', 'int: total_cost = 500', 3),
('Which of these is an immutable data type in Python?', 'list', 'set', 'tuple', 'dictionary', 3),
('If you wanted to represent a person''s age, which data type would be most appropriate?', 'int', 'str', 'list', 'bool', 1),
('What is the correct way to assign the string "Hello" to a variable called greeting?', 'greeting = Hello', 'greeting = "Hello"', 'greeting := "Hello"', 'greeting == "Hello"', 2),
('What will be the output of the following code? print(type([1, 2, 3]))', 'list', 'array', 'tuple', 'dict', 1),
('Which of the following can be used to create a floating-point number in Python?', 'float(3.14)', 'float("3.14")', '3.14', 'All of the above', 4),
('Which function can you use to get the length of a list, string, or tuple in Python?', 'size()', 'count()', 'length()', 'len()', 4),
('What will be the result of type(10 + 5.5) in Python?', 'int', 'float', 'complex', 'str', 2),
('Which statement is correct regarding Python variables?', 'Python variables need to be declared with a specific data type.', 'Python variables cannot change types after they are assigned.', 'Python variables can change types dynamically.', 'Python variables must be initialized before use.', 3);

-- Insert additional questions for Python Control Flow and Functions (Test 2)
INSERT INTO Questions (Question, Choice1, Choice2, Choice3, Choice4, Answer) VALUES 
('What is the output of the following code?\nif 5 > 3:\n    print("Hello")\nelse:\n    print("World")', 'Hello', 'World', 'HelloWorld', 'Error', 1),
('Which keyword is used to exit from a loop prematurely?', 'exit', 'break', 'stop', 'end', 2),
('What does the following code print?\nfor i in range(3):\n    print(i)', '0 1 2', '1 2 3', '0\n1\n2', '1\n2\n3', 3),
('Which of the following is the correct syntax for a while loop?', 'while condition:', 'while (condition):', 'while condition do:', 'Both A and B', 4),
('What is the purpose of the "continue" statement in a loop?', 'Exit the loop', 'Skip current iteration', 'Restart the loop', 'Pause the loop', 2),
('How do you define a function in Python?', 'function myFunc():', 'def myFunc():', 'define myFunc():', 'func myFunc():', 2),
('What does the "return" statement do in a function?', 'Prints a value', 'Exits the function and optionally returns a value', 'Continues execution', 'Declares a variable', 2),
('What is a parameter in a function?', 'The function name', 'A variable used in function definition', 'The return value', 'A function call', 2),
('What will this code output?\ndef greet(name="World"):\n    return f"Hello, {name}!"\nprint(greet())', 'Hello, !', 'Hello, World!', 'Hello, name!', 'Error', 2),
('Which of the following creates a global variable?', 'var x = 5', 'global x = 5', 'x = 5 (outside function)', 'local x = 5', 3),
('What is the scope of a variable defined inside a function?', 'Global', 'Local', 'Universal', 'Static', 2),
('What does this code print?\nx = 10\ndef func():\n    x = 20\n    print(x)\nfunc()\nprint(x)', '20\n10', '10\n20', '20\n20', '10\n10', 1),
('How do you pass multiple arguments to a function?', 'func(arg1; arg2)', 'func(arg1, arg2)', 'func(arg1 and arg2)', 'func(arg1 + arg2)', 2),
('What is a lambda function?', 'A named function', 'An anonymous function', 'A built-in function', 'A class method', 2),
('Which statement about Python functions is correct?', 'Functions must always return a value', 'Functions can return multiple values', 'Functions cannot have default parameters', 'Functions must be declared before use', 2);

-- Insert additional questions for Python Classes and Objects (Test 3)
INSERT INTO Questions (Question, Choice1, Choice2, Choice3, Choice4, Answer) VALUES 
('How do you define a class in Python?', 'class MyClass:', 'define MyClass:', 'Class MyClass():', 'create MyClass:', 1),
('What is the purpose of the __init__ method?', 'To destroy objects', 'To initialize object attributes', 'To call other methods', 'To print object info', 2),
('What is "self" in Python class methods?', 'A keyword', 'Reference to current instance', 'A built-in function', 'A variable type', 2),
('How do you create an object from a class?', 'obj = MyClass()', 'obj = new MyClass()', 'obj = create MyClass()', 'obj = MyClass.new()', 1),
('What is inheritance in OOP?', 'Creating multiple objects', 'A class acquiring properties from another class', 'Defining class methods', 'Initializing attributes', 2),
('Which method is automatically called when an object is created?', '__new__', '__init__', '__create__', '__start__', 2),
('What is method overriding?', 'Creating new methods', 'Redefining parent class methods in child class', 'Deleting methods', 'Calling multiple methods', 2),
('How do you access a private attribute in Python?', 'Using underscore prefix', 'Using double underscore prefix', 'Using private keyword', 'Private attributes cannot be accessed', 2),
('What is polymorphism?', 'Having multiple classes', 'Same interface for different data types', 'Creating objects', 'Defining methods', 2),
('Which keyword is used for inheritance?', 'extends', 'inherits', 'class Child(Parent):', 'inherit', 3),
('What does the super() function do?', 'Creates a new object', 'Calls parent class methods', 'Deletes the object', 'Prints object info', 2),
('What is an instance variable?', 'A variable shared by all instances', 'A variable unique to each instance', 'A method parameter', 'A class constant', 2),
('What is a class variable?', 'A variable unique to each instance', 'A variable shared by all instances', 'A local variable', 'A parameter', 2),
('How do you define a static method?', '@staticmethod', '@static', 'static def', 'def static', 1),
('What is encapsulation?', 'Creating multiple objects', 'Bundling data and methods together', 'Inheriting from parent class', 'Overriding methods', 2);

-- Insert into Tests table
INSERT INTO Tests (TestTitle, TimeLimit, TestDescription) VALUES 
('Python Data Types and Variables', 15, 'Basic data types ( ints and floats, other numbers, Booleans, strings, bytes) Basic Data Structures (lists, tuples, sets, dictionaries, list comprehensions, dictionary comprehensions)'),
('Python Control Flow and Functions', 20, 'Control Flow ( if else, while, for ) Functions (anatomy, variables and scope, functions as variables)'),
('Python Classes and Objects', 20, 'Classes and Objects (anatomy, static and instance methods, inheritance)');

-- Insert into TestQuestions table for all tests
INSERT INTO TestQuestions (TestID, QuestionID) VALUES 
-- Test 1: Python Data Types and Variables (Questions 1-15)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15),
-- Test 2: Python Control Flow and Functions (Questions 16-30)
(2, 16), (2, 17), (2, 18), (2, 19), (2, 20),
(2, 21), (2, 22), (2, 23), (2, 24), (2, 25),
(2, 26), (2, 27), (2, 28), (2, 29), (2, 30),
-- Test 3: Python Classes and Objects (Questions 31-45)
(3, 31), (3, 32), (3, 33), (3, 34), (3, 35),
(3, 36), (3, 37), (3, 38), (3, 39), (3, 40),
(3, 41), (3, 42), (3, 43), (3, 44), (3, 45);

-- Insert into Results table (GivenAnswer uses integers 1-4)
-- Sample results for Test 1: Python Data Types and Variables (Bryce's results)
INSERT INTO Results (StudentID, TestID, QuestionID, GivenAnswer) VALUES 
(9913033, 1, 1, 3),  -- 'list' is choice 3 (correct)
(9913033, 1, 2, 2),  -- 'bool' is choice 2 (correct)
(9913033, 1, 3, 2),  -- 'matrix' is choice 2 (correct)
(9913033, 1, 4, 2),  -- 'float' is choice 2 (correct)
(9913033, 1, 5, 2),  -- 'False' is choice 2 (correct)
(9913033, 1, 6, 1),  -- 'int' is choice 1 (correct)
(9913033, 1, 7, 3),  -- 'total_cost = 500' is choice 3 (correct)
(9913033, 1, 8, 3),  -- 'tuple' is choice 3 (correct)
(9913033, 1, 9, 1),  -- 'int' is choice 1 (correct)
(9913033, 1, 10, 1), -- 'greeting = Hello' is choice 1 (incorrect - should be 2)
(9913033, 1, 11, 1), -- 'list' is choice 1 (correct)
(9913033, 1, 12, 4), -- 'All of the above' is choice 4 (correct)
(9913033, 1, 13, 4), -- 'len()' is choice 4 (correct)
(9913033, 1, 14, 2), -- 'float' is choice 2 (correct)
(9913033, 1, 15, 3), -- 'Python variables can change types dynamically.' is choice 3 (correct)

-- Sample results for Test 2: Python Control Flow and Functions (Peter's results)
(10013661, 2, 16, 1), -- 'Hello' is choice 1 (correct)
(10013661, 2, 17, 2), -- 'break' is choice 2 (correct)
(10013661, 2, 18, 3), -- '0\n1\n2' is choice 3 (correct)
(10013661, 2, 19, 4), -- 'Both A and B' is choice 4 (correct)
(10013661, 2, 20, 2), -- 'Skip current iteration' is choice 2 (correct)
(10013661, 2, 21, 2), -- 'def myFunc():' is choice 2 (correct)
(10013661, 2, 22, 2), -- 'Exits the function...' is choice 2 (correct)
(10013661, 2, 23, 2), -- 'A variable used in function definition' is choice 2 (correct)
(10013661, 2, 24, 2), -- 'Hello, World!' is choice 2 (correct)
(10013661, 2, 25, 3), -- 'x = 5 (outside function)' is choice 3 (correct)
(10013661, 2, 26, 2), -- 'Local' is choice 2 (correct)
(10013661, 2, 27, 1), -- '20\n10' is choice 1 (correct)
(10013661, 2, 28, 2), -- 'func(arg1, arg2)' is choice 2 (correct)
(10013661, 2, 29, 2), -- 'An anonymous function' is choice 2 (correct)
(10013661, 2, 30, 1), -- 'Functions can return multiple values' is choice 2 (incorrect - chose 1)

-- Sample results for Test 3: Python Classes and Objects (Avneet's results)
(10005332, 3, 31, 1), -- 'class MyClass:' is choice 1 (correct)
(10005332, 3, 32, 2), -- 'To initialize object attributes' is choice 2 (correct)
(10005332, 3, 33, 2), -- 'Reference to current instance' is choice 2 (correct)
(10005332, 3, 34, 1), -- 'obj = MyClass()' is choice 1 (correct)
(10005332, 3, 35, 2), -- 'A class acquiring properties...' is choice 2 (correct)
(10005332, 3, 36, 2), -- '__init__' is choice 2 (correct)
(10005332, 3, 37, 2), -- 'Redefining parent class methods...' is choice 2 (correct)
(10005332, 3, 38, 2), -- 'Using double underscore prefix' is choice 2 (correct)
(10005332, 3, 39, 2), -- 'Same interface for different data types' is choice 2 (correct)
(10005332, 3, 40, 3), -- 'class Child(Parent):' is choice 3 (correct)
(10005332, 3, 41, 2), -- 'Calls parent class methods' is choice 2 (correct)
(10005332, 3, 42, 2), -- 'A variable unique to each instance' is choice 2 (correct)
(10005332, 3, 43, 2), -- 'A variable shared by all instances' is choice 2 (correct)
(10005332, 3, 44, 1), -- '@staticmethod' is choice 1 (correct)
(10005332, 3, 45, 3); -- 'Bundling data and methods together' is choice 2 (incorrect - chose 3)

-- Schema Notes:
-- 1. UserID is the primary key for all users (auto-incrementing)
-- 2. StudentID is required for students only, NULL for tutors
-- 3. TutorID is required for tutors only, NULL for students
-- 4. Results table still references StudentID (only students take tests)
-- 5. Role-based constraints ensure proper data integrity

-- This design allows:
-- - Students: Have both UserID (PK) and StudentID (for results tracking)
-- - Tutors: Have UserID (PK) and TutorID, but no StudentID
-- - Proper foreign key relationships for results (students only)
-- - Clean separation of concerns between authentication (UserID) and business logic (StudentID/TutorID)