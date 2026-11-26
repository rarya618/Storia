import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTitle } from "../misc/title";
import "../screenplay/world.css";

// a long read on one white page over the rail's tint, under the wordmark: the
// signed-out card, wide enough for running text
const LegalPage = ({title, children}: {title: string, children: ReactNode}) => {
  useTitle(title);
  return (
    <main className="sw sw-rev flex min-h-screen w-full overflow-y-auto !bg-[color:var(--rail)] px-4 py-12">
      <div className="sw-enter mx-auto w-full max-w-[720px]">
        <a href="/" className="logo mb-8 block text-center text-4xl leading-none hover:opacity-80">Storia</a>
        <article className="sw-legal rounded-[12px] border border-[color:var(--hair-strong)] bg-[color:var(--paper)] px-6 pb-8 pt-6 shadow-[0_1px_3px_rgb(27_27_31/0.08)] sm:px-10 sm:pt-8">
          {children}
        </article>
      </div>
    </main>
  );
};

const InlineLink = ({to, children}: {to: string, children: ReactNode}) => (
  <Link to={to}>{children}</Link>
);

export const TermsOfService = () => (
  <LegalPage title="Terms of Service">
    <h1>Storia Terms and Conditions of Use</h1>
    <h2>1. Terms</h2>
    <p>By accessing Storia, accessible from Storia.app, you are agreeing to be bound by Storia's Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in Storia are protected by copyright and trade mark law.</p>

    <h2>2. Use License</h2>
    <p>Permission is granted to temporarily download one copy of the materials on Storia for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
    <ul>
      <li>modify or copy the materials;</li>
      <li>use the materials for any commercial purpose or for any public display;</li>
      <li>attempt to reverse engineer any software contained on Storia;</li>
      <li>remove any copyright or other proprietary notations from the materials; or</li>
      <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
    </ul>
    <p>This will let Storia Inc. to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format.</p>

    <h2>3. Disclaimer</h2>
    <p>All the materials on Storia are provided "as is". Storia Inc. makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, Storia Inc. does not make any representations concerning the accuracy or reliability of the use of the materials on Storia or otherwise relating to such materials or any sites linked to Storia.</p>

    <h2>4. Limitations</h2>
    <p>Storia Inc. or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on Storia, even if Storia Inc. or an authorized representative of Storia has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.</p>

    <h2>5. Revisions and Errata</h2>
    <p>The materials appearing on Storia may include technical, typographical, or photographic errors. Storia Inc. will not promise that any of the materials in Storia are accurate, complete, or current. Storia Inc. may change the materials contained on Storia at any time without notice. Storia Inc. does not make any commitment to update the materials.</p>

    <h2>6. Links</h2>
    <p>Storia Inc. has not reviewed all of the sites linked to Storia and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by Storia Inc. of the site. The use of any linked website is at the user’s own risk.</p>

    <h2>7. Site Terms of Use Modifications</h2>
    <p>Storia Inc. may revise these Terms of Use for Storia at any time without prior notice. By using Storia, you are agreeing to be bound by the current version of these Terms and Conditions of Use.</p>

    <h2>8. Your Privacy</h2>
    <p>Please read our <InlineLink to="/privacy-policy">Privacy Policy</InlineLink>.</p>

    <h2>9. Governing Law</h2>
    <p>Any claim related to Storia shall be governed by the laws of the United States without regards to its conflict of law provisions.</p>
  </LegalPage>
);

export const PrivacyPolicy = () => (
  <LegalPage title="Privacy Policy">
    <h1>Privacy Policy for Storia Inc.</h1>
    <p>At Storia, accessible from Storia.app, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Storia and how we use it.</p>

    <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>

    <h2>General Data Protection Regulation (GDPR)</h2>
    <p>We are a Data Controller of your information.</p>

    <p>Storia Inc. legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Information we collect and the specific context in which we collect the information:</p>
    <ul>
      <li>Storia Inc. needs to perform a contract with you</li>
      <li>You have given Storia Inc. permission to do so</li>
      <li>Processing your personal information is in the legitimate interests of Storia Inc.</li>
      <li>Storia Inc. needs to comply with the law</li>
    </ul>

    <p>Storia Inc. will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</p>

    <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. If you wish to be informed what Personal Information we hold about you and if you want it to be removed from our systems, please contact us.</p>

    <p>In certain circumstances, you have the following data protection rights:</p>
    <ul>
      <li>The right to access, update or to delete the information we have on you.</li>
      <li>The right of rectification.</li>
      <li>The right to object.</li>
      <li>The right of restriction.</li>
      <li>The right to data portability</li>
      <li>The right to withdraw consent</li>
    </ul>

    <h2>Log Files</h2>
    <p>Storia follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>

    <h2>Error Reports</h2>
    <p>When something goes wrong in the Storia app, it sends a report to Sentry, the error-monitoring service we use, so we can find and fix the problem. A report holds what went wrong and where in the app's code, the page you were on, your browser and device type, your approximate location (city and country, which Sentry works out from your connection), the version of Storia, and the ID of your account. It doesn't hold your email address, your IP address, your cookies or your writing.</p>

    <h2>Cookies and Web Beacons</h2>
    <p>Like any other website, Storia uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

    <p>For more general information on cookies, please read <a href="https://www.generateprivacypolicy.com/#cookies">Cookies - Privacy Policy Generator</a>.</p>

    <h2>Privacy Policies</h2>
    <p>You may consult this list to find the Privacy Policy for each of the advertising partners of Storia.</p>

    <p>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Storia, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>

    <p>Note that Storia has no access to or control over these cookies that are used by third-party advertisers.</p>

    <h2>Third Party Privacy Policies</h2>
    <p>Storia's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>

    <p>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.</p>

    <h2>Children's Information</h2>
    <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>

    <p>Storia does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>

    <h2>Online Privacy Policy Only</h2>
    <p>Our Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Storia. This policy is not applicable to any information collected offline or via channels other than this website.</p>

    <h2>Consent</h2>
    <p>By using our website, you hereby consent to our Privacy Policy and agree to its <InlineLink to="/terms-of-service">terms</InlineLink>.</p>
  </LegalPage>
);
