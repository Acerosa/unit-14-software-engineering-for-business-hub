export function ResourcesPage() {
  return (
    <>
      <section className="panel">
        <h2>Unit reference</h2>
        <ul>
          <li>OCR Level 3 IT Unit 14 – Software Engineering for Business (H/507/5017)</li>
          <li>Programming language: Python</li>
          <li>Assessment: internally assessed assignments, not an examination unit</li>
        </ul>
      </section>
      <section className="panel">
        <h2>Planned resource sets</h2>
        <p>Python environment notes, Git/GitHub guidance, command-verb definitions and assignment support materials will be added when they are approved for learner use. They are not yet available in this foundation.</p>
      </section>
    </>
  );
}

export function HelpPage({ root }: { root: string }) {
  return (
    <>
      <section className="panel">
        <h2>How to navigate</h2>
        <ul>
          <li>Use <strong>Home</strong> to see the current starting points.</li>
          <li>Open <a href={`${root}/weeks/`}>Weeks</a> for the 19-week journey. Activities live inside each week.</li>
          <li>Open <a href={`${root}/assignments/`}>Assignments</a> for the four assignment workspaces.</li>
          <li>Open <a href={`${root}/project/`}>Project</a> to see how Assignments 2 to 4 connect.</li>
          <li>On a smaller screen, use the <strong>Menu</strong> button.</li>
        </ul>
      </section>
      <section className="panel">
        <h2>Keyboard access</h2>
        <p>Press Tab to move through links and controls. Use the skip link to move directly to the main content. Press Escape to close the mobile menu or the account dialog.</p>
      </section>
      <section className="panel">
        <h2>Account and progress</h2>
        <p>Teaching pages are readable without signing in. Sign in from <a href={`${root}/account/`}>Account</a> when you need learner context, onboarding or later submissions. The hub never treats browser identity as authority.</p>
      </section>
    </>
  );
}

export function AccountPage() {
  return (
    <section className="panel">
      <h2>Sign in or register</h2>
      <p>Use the Sign in control in the header. The shared Learning Platform account dialog handles sign in, registration and onboarding. Passwords are sent only to Supabase Auth and are not stored by this hub.</p>
      <p>Curriculum pages remain available without an account. Progress, enrolment and submissions require authentication.</p>
    </section>
  );
}
