import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

const TestsList = () => {
    const [tests, setTests] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [existingQuestions, setExistingQuestions] = useState([]);
    const [showExistingQuestions, setShowExistingQuestions] = useState(false);
    const [newTest, setNewTest] = useState({
        testTitle: '',
        testDescription: '',
        timeLimit: 30,
        questions: []
    });
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        choice1: '',
        choice2: '',
        choice3: '',
        choice4: '',
        answer: ''
    });

    // Helper function to convert integer answer (1-4) to choice text
    const getAnswerText = (question) => {
        switch(question.answer) {
            case 1: return question.choice1;
            case 2: return question.choice2;
            case 3: return question.choice3;
            case 4: return question.choice4;
            default: return question.choice1;
        }
    };

    // Helper function to format text with line breaks
    const formatTextWithLineBreaks = (text) => {
        if (!text) return '';
        return text.split('\\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < text.split('\\n').length - 1 && <br />}
            </span>
        ));
    };

    // Helper function to convert choice text back to integer (1-4)
    const getAnswerNumber = (question, answerText) => {
        if (answerText === question.choice1) return 1;
        if (answerText === question.choice2) return 2;
        if (answerText === question.choice3) return 3;
        if (answerText === question.choice4) return 4;
        return 1; // Default to 1 if no match
    };

    // Fetch tests on load
    useEffect(() => {
        const fetchTests = async () => {
            try {
                const { data, error } = await supabase.from('tests').select('*');
                if (error) {
                    console.error('Error fetching tests:', error);
                } else {
                    setTests(data || []);
                }
            } catch (error) {
                console.error('Error in fetchTests:', error);
            }
        };

        fetchTests();
    }, []);

    // Fetch questions when a test is selected
    const handleViewQuestions = async (testId) => {
        setSelectedTestId(testId);
        setShowCreateForm(false);
        
        // Find and store the selected test object
        const test = tests.find(t => t.testid === testId);
        setSelectedTest(test);

        try {
            const { data, error } = await supabase
                .from('testquestions')
                .select('questionid, questions(*)')
                .eq('testid', testId);

            if (error) {
                console.error('Error fetching questions:', error);
                setQuestions([]);
            } else {
                // Extract the Questions array from the join result
                const questionData = data.map((q) => q.questions);
                setQuestions(questionData || []);
            }
        } catch (error) {
            console.error('Error in handleViewQuestions:', error);
            setQuestions([]);
        }
    };

    // Handle creating new test form
    const handleCreateNewTest = () => {
        setShowCreateForm(true);
        setSelectedTestId(null);
        setSelectedTest(null);
        setShowExistingQuestions(false);
        setNewTest({
            testTitle: '',
            testDescription: '',
            timeLimit: 30,
            questions: []
        });
        setCurrentQuestion({
            question: '',
            choice1: '',
            choice2: '',
            choice3: '',
            choice4: '',
            answer: ''
        });
        
        // Fetch existing questions for selection
        fetchExistingQuestions();
    };

    // Fetch existing questions from database
    const fetchExistingQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('questionid', { ascending: true });
            
            if (error) {
                console.error('Error fetching existing questions:', error);
                setExistingQuestions([]);
            } else {
                setExistingQuestions(data || []);
            }
        } catch (error) {
            console.error('Error in fetchExistingQuestions:', error);
            setExistingQuestions([]);
        }
    };

    // Add existing question to test
    const addExistingQuestion = (question) => {
        // Check if question is already added
        const isAlreadyAdded = newTest.questions.some(q => 
            q.questionid === question.questionid || 
            (q.question === question.question && q.isExisting)
        );

        if (isAlreadyAdded) {
            alert('This question is already added to the test.');
            return;
        }

        // Convert integer answer to text for display
        const answerText = getAnswerText(question);

        const formattedQuestion = {
            id: `existing_${question.questionid}`,
            questionid: question.questionid,
            question: question.question,
            choice1: question.choice1,
            choice2: question.choice2,
            choice3: question.choice3,
            choice4: question.choice4,
            answer: answerText, // Store text for display
            answerNumber: question.answer, // Store original integer
            isExisting: true
        };

        setNewTest(prev => ({
            ...prev,
            questions: [...prev.questions, formattedQuestion]
        }));
    };

    // Add new question to test
    const handleAddQuestion = () => {
        // Validation
        if (!currentQuestion.question.trim() || 
            !currentQuestion.choice1.trim() || 
            !currentQuestion.choice2.trim() || 
            !currentQuestion.answer) {
            alert('Please fill in the question, at least 2 choices, and select the correct answer.');
            return;
        }

        // Convert answer text to integer for database storage
        const answerNumber = getAnswerNumber(currentQuestion, currentQuestion.answer);

        const questionToAdd = {
            id: `new_${Date.now()}`,
            question: currentQuestion.question,
            choice1: currentQuestion.choice1,
            choice2: currentQuestion.choice2,
            choice3: currentQuestion.choice3 || null,
            choice4: currentQuestion.choice4 || null,
            answer: currentQuestion.answer, // Keep text for display
            answerNumber: answerNumber, // Store integer for database
            isExisting: false
        };

        setNewTest(prev => ({
            ...prev,
            questions: [...prev.questions, questionToAdd]
        }));

        // Reset current question form
        setCurrentQuestion({
            question: '',
            choice1: '',
            choice2: '',
            choice3: '',
            choice4: '',
            answer: ''
        });
    };

    // Remove question from test
    const handleRemoveQuestion = (questionId) => {
        setNewTest(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== questionId)
        }));
    };

    // Save the complete test to database
    const handleSaveTest = async () => {
        // Validation
        if (!newTest.testTitle.trim() || 
            !newTest.testDescription.trim() || 
            newTest.questions.length === 0) {
            alert('Please fill in test title, description, and add at least one question.');
            return;
        }

        try {
            // Create the test
            const { data: testData, error: testError } = await supabase
                .from('tests')
                .insert({
                    testtitle: newTest.testTitle,
                    testdescription: newTest.testDescription,
                    timelimit: newTest.timeLimit
                })
                .select()
                .single();

            if (testError) throw testError;

            const testId = testData.testid;

            // Process each question
            for (const question of newTest.questions) {
                let questionId;

                if (question.isExisting) {
                    // Use existing question ID
                    questionId = question.questionid;
                } else {
                    // Create new question with integer answer
                    const { data: questionData, error: questionError } = await supabase
                        .from('questions')
                        .insert({
                            question: question.question,
                            choice1: question.choice1,
                            choice2: question.choice2,
                            choice3: question.choice3,
                            choice4: question.choice4,
                            answer: question.answerNumber // Use integer value
                        })
                        .select()
                        .single();

                    if (questionError) throw questionError;
                    questionId = questionData.questionid;
                }

                // Link question to test
                const { error: linkError } = await supabase
                    .from('testquestions')
                    .insert({
                        testid: testId,
                        questionid: questionId
                    });

                if (linkError) throw linkError;
            }

            alert('Test created successfully!');
            setShowCreateForm(false);
            
            // Reset form
            setNewTest({
                testTitle: '',
                testDescription: '',
                timeLimit: 30,
                questions: []
            });
            
            // Refresh tests list
            const { data: refreshedTests, error: refreshError } = await supabase
                .from('tests')
                .select('*');
                
            if (!refreshError) {
                setTests(refreshedTests || []);
            }

        } catch (error) {
            console.error('Error creating test:', error);
            alert('Error creating test. Please try again.');
        }
    };

    // Cancel test creation
    const cancelCreate = () => {
        setShowCreateForm(false);
        setNewTest({
            testTitle: '',
            testDescription: '',
            timeLimit: 30,
            questions: []
        });
        setCurrentQuestion({
            question: '',
            choice1: '',
            choice2: '',
            choice3: '',
            choice4: '',
            answer: ''
        });
    };

    return (
        <div className="card">
            <div className="header-with-button">
                <h2 className="header">📚 Available Tests</h2>
                <button 
                    className="home-nav-btn primary"
                    onClick={handleCreateNewTest}
                >
                    ➕ Create New Test
                </button>
            </div>

            {/* Tests List View */}
            {!showCreateForm && !selectedTestId && (
                <ul className="tests-list">
                    {tests.length > 0 ? (
                        tests.map((test) => (
                            <li key={test.testid} className="test-item">
                                <div className="test-item-header">
                                    <span className="test-id">📝 Test ID: {test.testid}</span>
                                    <span className="test-title">{test.testtitle}</span>
                                    <button
                                        className="test-questions-btn"
                                        onClick={() => handleViewQuestions(test.testid)}
                                    >
                                        View Questions
                                    </button>
                                </div>
                                <p className="test-description">{test.testdescription}</p>
                                <div className="test-meta">
                                    <span>⏱️ Time Limit: {test.timelimit} minutes</span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📚</div>
                            <h3>No Tests Available</h3>
                            <p>Create your first test to get started.</p>
                        </div>
                    )}
                </ul>
            )}

            {/* Create Test Form */}
            {showCreateForm && (
                <div className="create-test-form">
                    <div className="form-header">
                        <h3>✨ Create New Test</h3>
                        <button className="back-button" onClick={cancelCreate}>
                            ❌ Cancel
                        </button>
                    </div>

                    {/* Test Information Section */}
                    <div className="form-section">
                        <h4>📋 Test Information</h4>
                        <div className="form-group">
                            <label>Test Title:</label>
                            <input
                                type="text"
                                value={newTest.testTitle}
                                onChange={(e) => setNewTest(prev => ({...prev, testTitle: e.target.value}))}
                                placeholder="Enter test title..."
                                className="form-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Test Description:</label>
                            <textarea
                                value={newTest.testDescription}
                                onChange={(e) => setNewTest(prev => ({...prev, testDescription: e.target.value}))}
                                placeholder="Enter test description..."
                                className="form-textarea"
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Time Limit (minutes):</label>
                            <input
                                type="number"
                                value={newTest.timeLimit}
                                onChange={(e) => setNewTest(prev => ({...prev, timeLimit: parseInt(e.target.value) || 30}))}
                                min="1"
                                max="300"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="form-section">
                        <h4>❓ Add Questions</h4>
                        
                        {/* Question Type Selector */}
                        <div className="question-type-selector">
                            <button 
                                className={`question-type-btn ${!showExistingQuestions ? 'active' : ''}`}
                                onClick={() => setShowExistingQuestions(false)}
                            >
                                ✏️ Create New Question
                            </button>
                            <button 
                                className={`question-type-btn ${showExistingQuestions ? 'active' : ''}`}
                                onClick={() => setShowExistingQuestions(true)}
                            >
                                📚 Use Existing Question
                            </button>
                        </div>

                        {/* New Question Form */}
                        {!showExistingQuestions ? (
                            <div className="question-form">
                                <div className="form-group">
                                    <label>Question:</label>
                                    <textarea
                                        value={currentQuestion.question}
                                        onChange={(e) => setCurrentQuestion(prev => ({...prev, question: e.target.value}))}
                                        placeholder="Enter your question..."
                                        className="form-textarea"
                                        rows="2"
                                    />
                                </div>

                                <div className="choices-grid">
                                    <div className="form-group">
                                        <label>Choice 1 (Required):</label>
                                        <input
                                            type="text"
                                            value={currentQuestion.choice1}
                                            onChange={(e) => setCurrentQuestion(prev => ({...prev, choice1: e.target.value}))}
                                            placeholder="Choice 1..."
                                            className="form-input"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Choice 2 (Required):</label>
                                        <input
                                            type="text"
                                            value={currentQuestion.choice2}
                                            onChange={(e) => setCurrentQuestion(prev => ({...prev, choice2: e.target.value}))}
                                            placeholder="Choice 2..."
                                            className="form-input"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Choice 3 (Optional):</label>
                                        <input
                                            type="text"
                                            value={currentQuestion.choice3}
                                            onChange={(e) => setCurrentQuestion(prev => ({...prev, choice3: e.target.value}))}
                                            placeholder="Choice 3..."
                                            className="form-input"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Choice 4 (Optional):</label>
                                        <input
                                            type="text"
                                            value={currentQuestion.choice4}
                                            onChange={(e) => setCurrentQuestion(prev => ({...prev, choice4: e.target.value}))}
                                            placeholder="Choice 4..."
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Correct Answer:</label>
                                    <select
                                        value={currentQuestion.answer}
                                        onChange={(e) => setCurrentQuestion(prev => ({...prev, answer: e.target.value}))}
                                        className="form-select"
                                    >
                                        <option value="">Select correct answer...</option>
                                        {currentQuestion.choice1 && <option value={currentQuestion.choice1}>{currentQuestion.choice1}</option>}
                                        {currentQuestion.choice2 && <option value={currentQuestion.choice2}>{currentQuestion.choice2}</option>}
                                        {currentQuestion.choice3 && <option value={currentQuestion.choice3}>{currentQuestion.choice3}</option>}
                                        {currentQuestion.choice4 && <option value={currentQuestion.choice4}>{currentQuestion.choice4}</option>}
                                    </select>
                                </div>

                                <button 
                                    className="home-nav-btn secondary"
                                    onClick={handleAddQuestion}
                                >
                                    ➕ Add New Question
                                </button>
                            </div>
                        ) : (
                            /* Existing Questions Section */
                            <div className="existing-questions-section">
                                <p>Select from existing questions in the database:</p>
                                {existingQuestions.length > 0 ? (
                                    <div className="existing-questions-list">
                                        {existingQuestions.map((question) => {
                                            const correctAnswerText = getAnswerText(question);
                                            
                                            return (
                                                <div key={question.questionid} className="existing-question-item">
                                                    <div className="existing-question-content">
                                                        <h5>Question {question.questionid}</h5>
                                                        <p className="question-text">{formatTextWithLineBreaks(question.question)}</p>
                                                        <div className="question-choices">
                                                            <span className={question.answer === 1 ? 'correct-choice' : ''}>{formatTextWithLineBreaks(question.choice1)}</span>
                                                            <span className={question.answer === 2 ? 'correct-choice' : ''}>{formatTextWithLineBreaks(question.choice2)}</span>
                                                            {question.choice3 && <span className={question.answer === 3 ? 'correct-choice' : ''}>{formatTextWithLineBreaks(question.choice3)}</span>}
                                                            {question.choice4 && <span className={question.answer === 4 ? 'correct-choice' : ''}>{formatTextWithLineBreaks(question.choice4)}</span>}
                                                        </div>
                                                        <p className="correct-answer-note">✅ Correct: {correctAnswerText}</p>
                                                    </div>
                                                    <button 
                                                        className="home-nav-btn secondary"
                                                        onClick={() => addExistingQuestion(question)}
                                                        disabled={newTest.questions.some(q => 
                                                            q.questionid === question.questionid || 
                                                            (q.question === question.question && q.isExisting)
                                                        )}
                                                    >
                                                        {newTest.questions.some(q => 
                                                            q.questionid === question.questionid || 
                                                            (q.question === question.question && q.isExisting)
                                                        ) ? '✅ Added' : '➕ Add Question'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="no-questions-available">No existing questions found in the database.</p>
                                )}
                            </div>
                        )}

                        {/* Questions Preview */}
                        {newTest.questions.length > 0 && (
                            <div className="questions-preview">
                                <h4>📝 Questions Added ({newTest.questions.length})</h4>
                                {newTest.questions.map((q, index) => (
                                    <div key={q.id} className="question-preview">
                                        <div className="question-preview-header">
                                            <span>
                                                Question {index + 1} 
                                                {q.isExisting ? (
                                                    <span className="existing-badge">📚 Existing</span>
                                                ) : (
                                                    <span className="new-badge">✏️ New</span>
                                                )}
                                            </span>
                                            <button 
                                                className="remove-question-btn"
                                                onClick={() => handleRemoveQuestion(q.id)}
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>
                                        <p><strong>Q:</strong> {formatTextWithLineBreaks(q.question)}</p>
                                        <p><strong>Choices:</strong> {q.choice1}, {q.choice2}{q.choice3 && `, ${q.choice3}`}{q.choice4 && `, ${q.choice4}`}</p>
                                        <p><strong>✅ Correct:</strong> {q.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button 
                            className="home-nav-btn primary"
                            onClick={handleSaveTest}
                            disabled={newTest.questions.length === 0}
                        >
                            💾 Save Test ({newTest.questions.length} questions)
                        </button>
                        <button 
                            className="home-nav-btn secondary"
                            onClick={cancelCreate}
                        >
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* View Questions for Selected Test */}
            {selectedTestId && !showCreateForm && (
                <div className="card">
                    <button className="back-button" onClick={() => {setSelectedTestId(null); setSelectedTest(null);}}>
                        ← Back to Tests
                    </button>

                    <h3 className="header">📝 Questions for Test ID {selectedTestId}: {selectedTest?.testtitle || 'Loading...'}</h3>
                    {questions.length > 0 ? (
                        <ul className="questions-list">
                            {questions.map((q, index) => {
                                const correctAnswerText = getAnswerText(q);
                                
                                return (
                                    <li key={q.questionid} className="question-item">
                                        <div className="question-header">
                                            <h4>Question {index + 1}</h4>
                                        </div>
                                        <p className="question-text">{formatTextWithLineBreaks(q.question)}</p>
                                        <ul className="choices-list">
                                            <li className={q.answer === 1 ? 'correct-answer' : ''}>{formatTextWithLineBreaks(q.choice1)}</li>
                                            <li className={q.answer === 2 ? 'correct-answer' : ''}>{formatTextWithLineBreaks(q.choice2)}</li>
                                            {q.choice3 && <li className={q.answer === 3 ? 'correct-answer' : ''}>{formatTextWithLineBreaks(q.choice3)}</li>}
                                            {q.choice4 && <li className={q.answer === 4 ? 'correct-answer' : ''}>{formatTextWithLineBreaks(q.choice4)}</li>}
                                        </ul>
                                        <p className="correct-answer-label">✅ Correct Answer: {correctAnswerText}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>❓</div>
                            <h3>No Questions Found</h3>
                            <p>This test doesn't have any questions yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestsList;