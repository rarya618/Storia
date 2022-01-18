import Recent from '../components/Recent';
import NewProject from '../components/NewProject';

function Home() {
    return (
        <>
        <div className="title-bar standard no-select drag white">
          <p className="title green-color">New Document</p>
        </div>
        <div className="no-select spaced">
            <NewProject />
            <Recent />
        </div>
        </>
    )
}

export default Home;