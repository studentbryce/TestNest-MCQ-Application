import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import '../App.css';

export default function Results() {
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
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase
        .from('users')
        .select('studentid, firstname, lastname')
        .eq('role', 'student')
        .not('studentid', 'is', null);
      if (error) {
        console.error('Error fetching students:', error.message);
      } else {
        setStudents(data);
      }
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    async function fetchStudentResults() {
      if (!selectedStudent) return;

      setLoading(true);
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
          .eq('studentid', selectedStudent)

        if (resultsError) {
          console.error('Error fetching results:', resultsError)
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
          const getCorrectAnswerText = (question) => {
            const answerNum = parseInt(question.answer)
            switch (answerNum) {
              case 1: return question.choice1
              case 2: return question.choice2
              case 3: return question.choice3
              case 4: return question.choice4
              default: 
                console.warn(`Invalid correct answer: ${question.answer}, defaulting to Choice1`)
                return question.choice1
            }
          }

          // Convert student's given answer (integer) to text for display
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

          const correctAnswerText = getCorrectAnswerText(result.questions)
          const studentAnswerText = getAnswerTextFromNumber(result.questions, result.givenanswer)

          // Check if answer is correct by comparing the actual text values
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
            correctAnswer: correctAnswerText
          })
        })

        // Calculate final scores
        const formattedResults = Object.values(testResults).map(test => ({
          ...test,
          score: Math.round((test.correctAnswers / test.totalQuestions) * 100)
        }))

        setResults(formattedResults)
      } catch (error) {
        console.error('Error in fetchStudentResults:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudentResults()
  }, [selectedStudent])


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

  const backToStudents = () => {
    setSelectedStudent(null)
    setResults([])
    setSelectedResult(null)
  }

  // If viewing detailed results for a specific test
  if (selectedResult) {
    const selectedStudentInfo = students.find(s => s.studentid === selectedStudent)

    return (
      <div className="card">
        <button className="back-button" onClick={backToResults}>
          ← Back to Test Results
        </button>

        <h2>📊 Test Details: {selectedResult.testTitle}</h2>
        <h3>Student: {selectedStudentInfo?.firstname} {selectedStudentInfo?.lastname}</h3>

        <div className="result-summary-card">
          <div className="summary-stats">
            <div className="summary-stat">
              <h4>📊 Final Score</h4>
              <div className="stat-number" style={{ color: getScoreColor(selectedResult.score) }}>
                {getScoreEmoji(selectedResult.score)} {selectedResult.score}%
              </div>
            </div>
            <div className="summary-stat">
              <h4>📅 Date Taken</h4>
              <div className="stat-number" style={{ fontSize: '1.2rem' }}>
                {new Date(selectedResult.dateTaken).toLocaleDateString()}
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
                <div className="question-text-detail">{formatTextWithLineBreaks(detail.question)}</div>                <div className="answer-comparison">
                  <div className={`student-answer ${detail.correct ? 'correct-student-answer' : ''}`}>
                    <span className="answer-label">Student's Answer</span>
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

  const testMap = {}
  const questionMap = {}

  return (
    <div className="card">
      <h2 className="header">📊 Student Results (Tutor View)</h2>

      {!selectedStudent && (
        <div className="student-selection">
          <p>Select a student to view their test results:</p>

          <div className="students-container">
            <div className="students-grid">
              {students.map(student => (
                <div
                  key={student.studentid}
                  className="student-selection-card"
                  onClick={() => setSelectedStudent(student.studentid)}
                >
                  <div className="student-card-header">
                    <div className="student-avatar">
                      {student.firstname.charAt(0)}{student.lastname.charAt(0)}
                    </div>
                    <div className="student-id">
                      📝 ID: {student.studentid}
                    </div>
                  </div>
                  <div className="student-card-content">
                    <h3 className="student-name">
                      {student.firstname} {student.lastname}
                    </h3>
                    <p className="student-action">
                      📊 View Test Results
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedStudent && !selectedResult && (
        <div className="result-card">
          <button
            className="back-button"
            onClick={backToStudents}
          >
            ← Back to Students
          </button>

          <h3>
            📋 {students.find(s => s.studentid === selectedStudent)?.firstname} {students.find(s => s.studentid === selectedStudent)?.lastname}'s Test Results
          </h3>

          {loading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
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
                      <div className="result-score" style={{ color: getScoreColor(result.score) }}>
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
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results-message">
              <div className="empty-state">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                <h3>No Test Results Yet</h3>
                <p>This student hasn't completed any tests yet.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
