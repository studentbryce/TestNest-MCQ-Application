import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import '../App.css'

function StudentTests({ student }) {
  const [availableTests, setAvailableTests] = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(true)

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

  // Fetch tests from database
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true)
      try {
        // Fetch all tests with their questions
        const { data: tests, error: testsError } = await supabase
          .from('tests')
          .select('*')

        if (testsError) {
          console.error('Error fetching tests:', testsError)
          setAvailableTests([])
          return
        }

        // For each test, fetch its questions
        const testsWithQuestions = await Promise.all(
          tests.map(async (test) => {
            const { data: testQuestions, error: questionsError } = await supabase
              .from('testquestions')
              .select(`
                questionid,
                questions (
                  questionid,
                  question,
                  choice1,
                  choice2,
                  choice3,
                  choice4,
                  answer
                )
              `)
              .eq('testid', test.testid)

            if (questionsError) {
              console.error('Error fetching questions for test:', test.testid, questionsError)
              return {
                ...test,
                questions: []
              }
            }

            // Transform questions to match the expected format
            const questions = testQuestions.map((tq, index) => ({
              id: tq.questions.questionid,
              question: tq.questions.question,
              choices: [
                tq.questions.choice1,
                tq.questions.choice2,
                tq.questions.choice3,
                tq.questions.choice4
              ].filter(choice => choice && choice.trim() !== ''),
              correct: tq.questions.answer, // This will be the actual correct answer text
              correctIndex: [
                tq.questions.choice1,
                tq.questions.choice2,
                tq.questions.choice3,
                tq.questions.choice4
              ].indexOf(tq.questions.answer) // Find the index of the correct answer
            }))

            return {
              id: test.testid,
              title: test.testtitle,
              description: test.testdescription || 'No description available',
              duration: test.timelimit,
              questions: questions
            }
          })
        )

        setAvailableTests(testsWithQuestions)
      } catch (error) {
        console.error('Error in fetchTests:', error)
        setAvailableTests([])
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  const startTest = (test) => {
    setSelectedTest(test)
    setCurrentQuestion(0)
    setAnswers({})
    setTestCompleted(false)
    setTestResult(null)
  }

  const selectAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < selectedTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitTest = async () => {
    // Calculate score
    let correct = 0
    const resultEntries = []

    selectedTest.questions.forEach((q, index) => {
      const selectedChoice = answers[q.id]
      const selectedAnswerText = selectedChoice !== undefined ? q.choices[selectedChoice] : 'No Answer'
      const isCorrect = selectedAnswerText === q.correct

      if (isCorrect) {
        correct++
      }

      // Prepare result entry for database
      resultEntries.push({
        studentid: student.studentId,
        testid: selectedTest.id,
        questionid: q.id,
        givenanswer: selectedChoice + 1 // Convert from 0-based index to 1-based integer
      })
    })

    const score = Math.round((correct / selectedTest.questions.length) * 100)
    
    try {
      // Save results to database
      const { error } = await supabase
        .from('results')
        .insert(resultEntries)

      if (error) {
        console.error('Error saving results:', error)
        // Still show results even if save failed
      }
    } catch (error) {
      console.error('Error in submitTest:', error)
    }

    setTestResult({
      score,
      correct,
      total: selectedTest.questions.length,
      percentage: score
    })
    setTestCompleted(true)
  }

  const backToTests = () => {
    setSelectedTest(null)
    setCurrentQuestion(0)
    setAnswers({})
    setTestCompleted(false)
    setTestResult(null)
  }

  if (testCompleted && testResult) {
    return (
      <div className="card">
        <h2>🎉 Test Completed!</h2>
        <div className="test-result-card">
          <div className="result-summary">
            <h3>📊 Your Results</h3>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-percentage">{testResult.percentage}%</span>
              </div>
              <div className="score-details">
                <p>✅ Correct: {testResult.correct}</p>
                <p>❌ Incorrect: {testResult.total - testResult.correct}</p>
                <p>📝 Total Questions: {testResult.total}</p>
              </div>
            </div>
          </div>
          <div className="result-actions">
            <button className="home-nav-btn primary" onClick={backToTests}>
              📝 Take Another Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedTest) {
    const question = selectedTest.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / selectedTest.questions.length) * 100

    return (
      <div className="card">
        <div className="test-header">
          <h2>📝 {selectedTest.title}</h2>
          <div className="test-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <span>Question {currentQuestion + 1} of {selectedTest.questions.length}</span>
          </div>
        </div>

        <div className="question-container">
          <h3 className="question-text">
            {currentQuestion + 1}. {formatTextWithLineBreaks(question.question)}
          </h3>

          <div className="answer-choices">
            {question.choices.map((choice, index) => (
              <label key={index} className="choice-label">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={answers[question.id] === index}
                  onChange={() => selectAnswer(question.id, index)}
                />
                <span className="choice-text">{formatTextWithLineBreaks(choice)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="test-navigation">
          <button 
            className="home-nav-btn secondary"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === selectedTest.questions.length - 1 ? (
            <button 
              className="home-nav-btn primary"
              onClick={submitTest}
              disabled={Object.keys(answers).length !== selectedTest.questions.length}
            >
              🎯 Submit Test
            </button>
          ) : (
            <button 
              className="home-nav-btn primary"
              onClick={nextQuestion}
            >
              Next →
            </button>
          )}
        </div>

        <button className="back-button" onClick={backToTests}>
          ← Back to Test List
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>📝 Available Tests</h2>
      {loading ? (
        <p>Loading tests...</p>
      ) : (
        <>
          <p>Choose a test to begin:</p>
          
          <div className="tests-grid">
            {availableTests.map((test) => (
              <div key={test.id} className="test-card">
                <h3>{test.title}</h3>
                <p className="test-description">{test.description}</p>
                <div className="test-info">
                  <span>⏱️ {test.duration} minutes</span>
                  <span>❓ {test.questions.length} questions</span>
                </div>
                <button 
                  className="home-nav-btn primary"
                  onClick={() => startTest(test)}
                  disabled={test.questions.length === 0}
                >
                  {test.questions.length === 0 ? '❌ No Questions' : '🚀 Start Test'}
                </button>
              </div>
            ))}
          </div>

          {availableTests.length === 0 && !loading && (
            <p className="no-tests-message">
              📚 No tests are currently available. Check back later!
            </p>
          )}
        </>
      )}
    </div>
  )
}

export default StudentTests
