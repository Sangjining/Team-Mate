import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

const features = [
    { icon: '◈', title: '팀을 하나의 공간에', description: '팀을 만들고 구성원을 초대해 프로젝트를 함께 관리하세요.' },
    { icon: '▦', title: '업무 흐름을 한눈에', description: '칸반보드로 업무를 정리하고 진행 상태를 확인하세요.' },
    { icon: '▤', title: '놓치지 않는 일정', description: '팀 일정과 업무 마감일을 하나의 달력에서 확인하세요.' },
    { icon: '◉', title: '명확한 진행 현황', description: '팀의 업무 현황과 프로젝트 진행률을 쉽게 파악하세요.' },
];

export default function LandingPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <Link className={styles.brand} to="/" aria-label="Team-Mate 홈">
                        <span className={styles.brandIcon}>T</span>
                        <span>Team-Mate</span>
                    </Link>
                    <nav className={styles.nav} aria-label="계정 메뉴">
                        <Link className={styles.loginLink} to="/auth/login">로그인</Link>
                        <Link className={styles.navSignup} to="/auth/signup">회원가입 <span aria-hidden="true">→</span></Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className={styles.hero}>
                    <div className={styles.glowOne} aria-hidden="true" />
                    <div className={styles.glowTwo} aria-hidden="true" />
                    <div className={styles.heroInner}>
                        <div className={styles.heroCopy}>
                            <span className={styles.badge}><span className={styles.badgeDot} /> 더 나은 팀 협업의 시작</span>
                            <h1>함께하는 프로젝트,<br /><span>더 쉬워지는 협업.</span></h1>
                            <p className={styles.heroDescription}>
                                흩어진 업무와 일정을 한곳에 모으세요.<br />
                                Team-Mate와 함께라면 팀의 모든 순간이 더 명확해집니다.
                            </p>
                            <div className={styles.actions}>
                                <Link to="/auth/signup" className={styles.primaryButton}>무료로 시작하기 <span aria-hidden="true">→</span></Link>
                                <Link to="/auth/login" className={styles.secondaryButton}>로그인하기</Link>
                            </div>
                            <p className={styles.helper}>Team-Mate가 처음이신가요? 지금 가입하고 팀을 만들어 보세요.</p>
                        </div>

                        <div className={styles.previewWrap} aria-label="Team-Mate 업무 관리 화면 예시">
                            <div className={styles.previewWindow}>
                                <div className={styles.previewTop}><span className={styles.previewLogo}>T</span><span>프로젝트 업무 현황</span><span className={styles.previewMore}>•••</span></div>
                                <div className={styles.previewTitle}>팀 프로젝트 <span className={styles.previewTag}>진행 중</span></div>
                                <div className={styles.previewProgress}><div className={styles.previewProgressHeader}><span>프로젝트 진행률</span><strong>68%</strong></div><div className={styles.previewTrack}><span /></div></div>
                                <div className={styles.kanban}>
                                    <div className={styles.kanbanColumn}><div className={styles.kanbanHeading}><span className={styles.grayDot} /> 해야 할 일 <b>2</b></div><div className={styles.taskCard}><strong>서비스 화면 구성</strong><span>UI 디자인</span><small>10월 29일</small></div><div className={styles.taskCard}><strong>프로젝트 문서 정리</strong><span>문서 작업</span><small>10월 31일</small></div></div>
                                    <div className={styles.kanbanColumn}><div className={styles.kanbanHeading}><span className={styles.blueDot} /> 진행 중 <b>1</b></div><div className={styles.taskCard}><strong>로그인 기능 연동</strong><span>개발</span><small>11월 2일</small></div></div>
                                    <div className={styles.kanbanColumn}><div className={styles.kanbanHeading}><span className={styles.greenDot} /> 완료 <b>2</b></div><div className={styles.taskCard}><strong>데이터베이스 설계</strong><span>개발</span><small>완료 ✓</small></div><div className={styles.taskCard}><strong>팀 생성 기능</strong><span>개발</span><small>완료 ✓</small></div></div>
                                </div>
                            </div>
                            <span className={styles.previewCaption}>업무 현황 미리보기 · 예시 화면</span>
                        </div>
                    </div>
                </section>

                <section className={styles.features} id="features">
                    <div className={styles.sectionHeading}><span>WHY TEAM-MATE</span><h2>팀워크에 필요한 기능을<br />한곳에서 만나보세요.</h2><p>팀 관리부터 업무, 일정, 진행 현황까지 간편하게 연결됩니다.</p></div>
                    <div className={styles.featureGrid}>{features.map((feature) => <article className={styles.featureCard} key={feature.title}><span className={styles.featureIcon}>{feature.icon}</span><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>
                </section>

                <section className={styles.cta}><div className={styles.ctaInner}><h2>함께할 준비가 되셨나요?</h2><p>Team-Mate에서 첫 번째 팀을 만들고 협업을 시작해 보세요.</p><Link to="/auth/signup" className={styles.ctaButton}>지금 시작하기 →</Link></div></section>
            </main>
            <footer className={styles.footer}><span>Team-Mate</span><span>함께 만드는 더 나은 협업</span></footer>
        </div>
    );
}
