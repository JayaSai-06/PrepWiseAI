
import React, { useState, useEffect } from 'react';
import '../style/interview.scss';
import { useInterview } from '../hooks/useInterview.js';
import { useParams } from 'react-router-dom';

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions' },
    { id: 'behavioral', label: 'Behavioral Questions' },
    { id: 'roadmap', label: 'Road Map' }
];

// Question Card
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="q-card">
            <button
                type="button"
                className="q-card__header"
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
            >
                <span className="q-card__index">Q{index + 1}</span>

                <span className="q-card__question">
                    {item.question}
                </span>

                <span
                    className={`q-card__chevron ${
                        open ? 'q-card__chevron--open' : ''
                    }`}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>

            {open && (
                <div className="q-card__body">
                    <div className="q-card__section">
                        <span className="q-card__tag q-card__tag--intention">
                            Intention
                        </span>
                        <p>{item.intention}</p>
                    </div>

                    <div className="q-card__section">
                        <span className="q-card__tag q-card__tag--answer">
                            Model Answer
                        </span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Roadmap Day
const RoadMapDay = ({ day }) => (
    <div className="roadmap-day">
        <div className="roadmap-day__header">
            <span className="roadmap-day__badge">
                Day {day.day}
            </span>

            <h3 className="roadmap-day__focus">
                {day.focus}
            </h3>
        </div>

        <ul className="roadmap-day__tasks">
            {day.tasks.map((task, index) => (
                <li key={index}>
                    <span className="roadmap-day__bullet" />
                    {task}
                </li>
            ))}
        </ul>
    </div>
);

// Main Component
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical');
    const [error, setError] = useState('');

    const {
        report,
        getReportById,
        loading,
        getResumePdf
    } = useInterview();

    const { interviewId } = useParams();

    useEffect(() => {
        let cancelled = false;

        const fetchReport = async () => {
            if (!interviewId) {
                setError('Interview ID is missing.');
                return;
            }

            try {
                setError('');
                await getReportById(interviewId);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        'Failed to load the interview report.'
                    );
                }
            }
        };

        fetchReport();

        return () => {
            cancelled = true;
        };
    }, [interviewId]);

    // Loading state
    if (loading) {
        return (
            <main className="loading-screen">
                <h1>Loading your interview plan...</h1>
            </main>
        );
    }

    // Error state
    if (error) {
        return (
            <main className="loading-screen">
                <h1>Unable to load interview report</h1>
                <p>{error}</p>
            </main>
        );
    }

    // Empty report state
    if (!report) {
        return (
            <main className="loading-screen">
                <h1>No interview report found.</h1>
            </main>
        );
    }

    const technicalQuestions = report.technicalQuestions || [];
    const behavioralQuestions = report.behavioralQuestions || [];
    const preparationPlan = report.preparationPlan || [];
    const skillGaps = report.skillGaps || [];

    const matchScore = Number(report.matchScore) || 0;

    const scoreColor =
        matchScore >= 80
            ? 'score--high'
            : matchScore >= 60
                ? 'score--mid'
                : 'score--low';

    const handleDownload = async () => {
        try {
            await getResumePdf(interviewId);
        } catch (err) {
            console.error('Failed to download resume:', err);
        }
    };

    return (
        <div className="interview-page">
            <div className="interview-layout">

                {/* Left Navigation */}
                <nav className="interview-nav">
                    <div className="nav-content">
                        <p className="interview-nav__label">
                            Sections
                        </p>

                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                type="button"
                                className={`interview-nav__item ${
                                    activeNav === item.id
                                        ? 'interview-nav__item--active'
                                        : ''
                                }`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                {item.id === 'technical' && (
                                    <span className="interview-nav__icon">
                                        &lt;/&gt;
                                    </span>
                                )}

                                {item.id === 'behavioral' && (
                                    <span className="interview-nav__icon">
                                        💬
                                    </span>
                                )}

                                {item.id === 'roadmap' && (
                                    <span className="interview-nav__icon">
                                        ➤
                                    </span>
                                )}

                                {item.label}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleDownload}
                        className="button primary-button"
                        disabled={!interviewId}
                    >
                        Download Resume
                    </button>
                </nav>

                <div className="interview-divider" />

                {/* Center Content */}
                <main className="interview-content">

                    {activeNav === 'technical' && (
                        <section>
                            <div className="content-header">
                                <h2>Technical Questions</h2>
                                <span className="content-header__count">
                                    {technicalQuestions.length} questions
                                </span>
                            </div>

                            <div className="q-list">
                                {technicalQuestions.map((question, index) => (
                                    <QuestionCard
                                        key={index}
                                        item={question}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className="content-header">
                                <h2>Behavioral Questions</h2>
                                <span className="content-header__count">
                                    {behavioralQuestions.length} questions
                                </span>
                            </div>

                            <div className="q-list">
                                {behavioralQuestions.map((question, index) => (
                                    <QuestionCard
                                        key={index}
                                        item={question}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className="content-header">
                                <h2>Preparation Road Map</h2>
                                <span className="content-header__count">
                                    {preparationPlan.length}-day plan
                                </span>
                            </div>

                            <div className="roadmap-list">
                                {preparationPlan.map(day => (
                                    <RoadMapDay
                                        key={day.day}
                                        day={day}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className="interview-divider" />

                {/* Right Sidebar */}
                <aside className="interview-sidebar">

                    {/* Match Score */}
                    <div className="match-score">
                        <p className="match-score__label">
                            Match Score
                        </p>

                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className="match-score__value">
                                {matchScore}
                            </span>

                            <span className="match-score__pct">%</span>
                        </div>

                        <p className="match-score__sub">
                            {matchScore >= 80
                                ? 'Strong match for this role'
                                : matchScore >= 60
                                    ? 'Good match with some areas to improve'
                                    : 'More preparation recommended'}
                        </p>
                    </div>

                    <div className="sidebar-divider" />

                    {/* Skill Gaps */}
                    <div className="skill-gaps">
                        <p className="skill-gaps__label">
                            Skill Gaps
                        </p>

                        <div className="skill-gaps__list">
                            {skillGaps.map((gap, index) => (
                                <span
                                    key={index}
                                    className={`skill-tag skill-tag--${gap.severity}`}
                                >
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Interview;
