import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../App.css';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        supabase
            .from('users')
            .select('*')
            .eq('role', 'student')
            .not('studentid', 'is', null)
            .then(({ data, error }) => {
                if (error) console.error('Error fetching users:', error);
                else setUsers(data);
            
                setLoading(false);
            });
    }, []);

    return (
        <div className="card">
            <h2 className="header">🎓 Registered Students</h2>
            {loading ? (
                <div className="loading-state">
                    <p>Loading students...</p>
                </div>
            ) : users.length > 0 ? (
                <div className="users-container">
                    <div className="users-list">
                        <div className="list-header">
                            <h3>📋 Student Details</h3>
                        </div>
                        
                        <div className="users-table">
                            <div className="table-header">
                                <div className="header-cell">👤 Name</div>
                                <div className="header-cell">🆔 Student ID</div>
                                <div className="header-cell">📧 Username</div>
                                <div className="header-cell">📅 Registration</div>
                            </div>
                            
                            {users.map(user => (
                                <div key={user.studentid || user.userid} className="table-row">
                                    <div className="cell student-info">
                                        <div className="student-avatar-small">
                                            {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                        </div>
                                        <div className="student-details">
                                            <strong>{user.firstname} {user.lastname}</strong>
                                        </div>
                                    </div>
                                    <div className="cell" data-label="🆔 Student ID: ">
                                        <span className="student-id-badge">{user.studentid || 'N/A'}</span>
                                    </div>
                                    <div className="cell" data-label="📧 Username: ">
                                        <span className="username-text">{user.username}</span>
                                    </div>
                                    <div className="cell" data-label="📅 Registration: ">
                                        <span className="date-text">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-state">
                    <div style={{fontSize: '4rem', marginBottom: '1rem'}}>👥</div>
                    <h3>No Students Registered</h3>
                    <p>No students have registered yet.</p>
                </div>
            )}
        </div>
    );
}
