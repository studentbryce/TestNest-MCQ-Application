import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import '../App.css'

function StudentResults({ student }) {
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
  const [results, setResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper function to convert integer answer (1-4) to choice text
  const getCorrectAnswerText = (question) => {
    const answerNum = parseInt(question.answer)
    switch(answerNum) {
      case 1: return question.choice1
      case 2: return question.choice2
      case 3: return question.choice3
      case 4: return question.choice4
      default: 
        console.warn(`Invalid correct answer: ${question.answer}, defaulting to Choice1`)
        return question.choice1
    }
  }

  // Helper function to convert integer (1-4) to choice text for any question
  const getAnswerTextFromNumber = (question, answerNumber) => {
    const answerNum = parseInt(answerNumber)
    switch(answerNum) {
      case 1: return question.choice1
      case 2: return question.choice2
      case 3: return question.choice3
      case 4: return question.choice4
      default: 
        console.warn(`Invalid answer number: ${answerNumber}, defaulting to Choice1`)
        return question.choice1
    }
  }

  // Fetch student results from database
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        // Fetch all results for this student
        const { data: rawResults, error: resultsError } = await supabase
          .from('results')
          .select(`
            resultid,
            testid,
            questionid,
            givenanswer,
            created_at,
            tests (
              testtitle,
              testdescription,
              timelimit
            ),
            questions (
              question,
              choice1,
              choice2,
              choice3,
              choice4,
              answer
            )
          `)
          .eq('studentid', student.studentId)

        if (resultsError) {
          console.error('Error fetching results:', resultsError)
          setResults([])
          return
        }

        console.log('StudentResults - Student ID:', student.studentId)
        console.log('StudentResults - Raw results:', rawResults)
        
        if (!rawResults || rawResults.length === 0) {
          console.log('No results found for student:', student.studentId)
          setResults([])
          return
        }

        // Group results by test and calculate scores
        const testResults = {}
        
        rawResults.forEach(result => {
          const testId = result.testid
          
          if (!testResults[testId]) {
            testResults[testId] = {
              id: testId,
              testTitle: result.tests.testtitle,
              description: result.tests.testdescription,
              timeLimit: result.tests.timelimit,
              questions: [],
              totalQuestions: 0,
              correctAnswers: 0,
              score: 0,
              dateTaken: result.created_at,
              submissionTime: result.created_at,
              duration: `${result.tests.timelimit} minutes`,
              status: 'completed',
              details: []
            }
          }

          // Get correct answer text based on Answer integer (1-4)
          const correctAnswerText = getCorrectAnswerText(result.questions)
          
          // Convert student's given answer (integer) to text for display
          const studentAnswerText = getAnswerTextFromNumber(result.questions, result.givenanswer)

          // Check if answer is correct by comparing the actual text values
          // This ensures we're comparing what the student actually selected with the correct answer text
          const isCorrect = studentAnswerText === correctAnswerText
          
          // Debug logging to help troubleshoot
          console.log(`Question: ${result.questions.question}`)
          console.log(`Student Selected: "${studentAnswerText}"`)
          console.log(`Correct Answer: "${correctAnswerText}"`)
          console.log(`Is Correct: ${isCorrect}`)
          console.log('---')
          if (isCorrect) {
            testResults[testId].correctAnswers++
          }

          testResults[testId].totalQuestions++
          testResults[testId].details.push({
            question: result.questions.question,
            yourAnswer: studentAnswerText, // Display student's answer as text
            correct: isCorrect,
            correctAnswer: correctAnswerText // Display correct answer as text
          })
        })

        // Calculate final scores
        const formattedResults = Object.values(testResults).map(test => ({
          ...test,
          score: Math.round((test.correctAnswers / test.totalQuestions) * 100)
        }))

        setResults(formattedResults)
      } catch (error) {
        console.error('Error in fetchResults:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    if (student && student.studentId) {
      fetchResults()
    }
  }, [student])

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50' // Green
    if (score >= 75) return '#FF9800' // Orange
    if (score >= 60) return '#FFC107' // Yellow
    return '#F44336' // Red
  }

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🏆'
    if (score >= 75) return '🎉'
    if (score >= 60) return '👍'
    return '📚'
  }

  const viewDetails = (result) => {
    setSelectedResult(result)
  }

  const backToResults = () => {
    setSelectedResult(null)
  }

  if (selectedResult) {
    return (
      <div className="card">
        <button className="back-button" onClick={backToResults}>
          ← Back to Results
        </button>
        
        <h2>📊 Test Details: {selectedResult.testTitle}</h2>
        
        <div className="result-summary-card">
          <div className="summary-stats">
            <div className="summary-stat">
              <h4>📊 Final Score</h4>
              <div className="stat-number" style={{ color: getScoreColor(selectedResult.score), fontSize: '3rem' }}>
                {getScoreEmoji(selectedResult.score)} {selectedResult.score}%
              </div>
            </div>
            <div className="summary-stat">
              <h4>📅 Submitted</h4>
              <div className="stat-number" style={{ fontSize: '1rem' }}>
                {new Date(selectedResult.submissionTime).toLocaleDateString()}
              </div>
              <div className="stat-number" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                🕒 {new Date(selectedResult.submissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="summary-stat">
              <h4>⏱️ Duration</h4>
              <div className="stat-number" style={{ fontSize: '1.2rem' }}>
                {selectedResult.duration}
              </div>
            </div>
            <div className="summary-stat">
              <h4>✅ Correct Answers</h4>
              <div className="stat-number" style={{ fontSize: '1.5rem' }}>
                {Math.round(selectedResult.correctAnswers)}/{selectedResult.totalQuestions}
              </div>
            </div>
          </div>
        </div>

        {selectedResult.details && (
          <div className="question-details-list">
            <h3>📝 Question by Question Review</h3>
            {selectedResult.details.map((detail, index) => (
              <div key={index} className={`question-detail-item ${detail.correct ? 'correct' : 'incorrect'}`}>
                <div className="question-detail-header">
                  <div className="question-number">Q{index + 1}</div>
                  <span className={`answer-status ${detail.correct ? 'correct' : 'incorrect'}`}>
                    {detail.correct ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                <div className="question-text-detail">{formatTextWithLineBreaks(detail.question)}</div>
                <div className="answer-comparison">
                  <div className={`student-answer ${detail.correct ? 'correct-student-answer' : ''}`}>
                    <span className="answer-label">Your Answer</span>
                    <p className="answer-text">
                      {formatTextWithLineBreaks(detail.yourAnswer)} {detail.correct ? '✅' : ''}
                    </p>
                  </div>
                  {!detail.correct && detail.correctAnswer && (
                    <div className="correct-answer">
                      <span className="answer-label">Correct Answer</span>
                      <p className="answer-text">{formatTextWithLineBreaks(detail.correctAnswer)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="result-card">
      <h2>📊 My Test Results</h2>
      {loading ? (
        <p>Loading your results...</p>
      ) : (
        <>
          <p>View your performance on completed tests:</p>

          {results.length > 0 ? (
            <>
              <div className="results-overview">
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>📝 Tests Taken</h3>
                    <div className="stat-value">{results.length}</div>
                  </div>
                  <div className="stat-card">
                    <h3>📈 Average Score</h3>
                    <div className="stat-value">
                      {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}%
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>🏆 Best Score</h3>
                    <div className="stat-value">{Math.max(...results.map(r => r.score))}%</div>
                  </div>
                </div>
              </div>

              <div className="results-list">
                <h3>📋 Test History</h3>
                {results.map((result) => (
                  <div key={result.id} className="result-item">
                    <div className="result-header">
                      <div className="result-title">
                        <h4>{result.testTitle}</h4>
                        <span className="result-date">
                          📅 {new Date(result.submissionTime).toLocaleDateString()}
                        </span>
                        <span className="result-time">
                          🕒 {new Date(result.submissionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="result-score" style={{color: getScoreColor(result.score)}}>
                        {getScoreEmoji(result.score)} {result.score}%
                      </div>
                    </div>
                    
                    <div className="result-details">
                      <span>✅ {result.correctAnswers}/{result.totalQuestions} correct</span>
                      <span>⏱️ {result.duration}</span>
                      <button 
                        className="home-nav-btn secondary"
                        onClick={() => viewDetails(result)}
                      >
                        👀 View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results-message">
              <div className="empty-state">
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📊</div>
                <h3>No Test Results Yet</h3>
                <p>Take your first test to see your results here!</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StudentResults