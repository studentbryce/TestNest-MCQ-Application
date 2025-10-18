// demoQuestions.js - Python-focused MCQ questions for TestNest

export const demoQuestions = [
    {
        id: 1,
        question: 'What is the correct way to create a list in Python?',
        choices: [
            'my_list = [1, 2, 3, 4]',
            'my_list = (1, 2, 3, 4)',
            'my_list = {1, 2, 3, 4}',
            'my_list = <1, 2, 3, 4>',
        ],
        correctAnswer: 0,
    },
    {
        id: 2,
        question: 'Which keyword is used to define a function in Python?',
        choices: ['function', 'def', 'func', 'define'],
        correctAnswer: 1,
    },
    {
        id: 3,
        question: 'What does the len() function return?',
        choices: [
            'The last element of a sequence',
            'The first element of a sequence',
            'The number of elements in a sequence',
            'The middle element of a sequence',
        ],
        correctAnswer: 2,
    },
    {
        id: 4,
        question: 'Which of the following is the correct way to comment in Python?',
        choices: [
            '// This is a comment',
            '/* This is a comment */',
            '# This is a comment',
            '<!-- This is a comment -->',
        ],
        correctAnswer: 2,
    },
    {
        id: 5,
        question: 'What is the output of: print(type([1, 2, 3]))?',
        choices: [
            "<class 'tuple'>",
            "<class 'list'>",
            "<class 'dict'>",
            "<class 'set'>",
        ],
        correctAnswer: 1,
    },
    {
        id: 6,
        question: 'Which method is used to add an element to the end of a list?',
        choices: ['add()', 'append()', 'insert()', 'push()'],
        correctAnswer: 1,
    },
    {
        id: 7,
        question: 'What is the correct syntax for a for loop in Python?',
        choices: [
            'for i in range(10):',
            'for (i = 0; i < 10; i++):',
            'for i = 1 to 10:',
            'for i in 1..10:',
        ],
        correctAnswer: 0,
    },
    {
        id: 8,
        question: 'Which of the following creates a dictionary in Python?',
        choices: [
            'my_dict = [key: value]',
            'my_dict = (key: value)',
            'my_dict = {key: value}',
            'my_dict = <key: value>',
        ],
        correctAnswer: 2,
    },
    {
        id: 9,
        question: 'What is the result of 3 ** 2 in Python?',
        choices: ['6', '9', '5', '8'],
        correctAnswer: 1,
    },
    {
        id: 10,
        question: 'Which keyword is used to handle exceptions in Python?',
        choices: ['catch', 'except', 'handle', 'error'],
        correctAnswer: 1,
    },
];
