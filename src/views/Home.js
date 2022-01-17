import Recent from '../components/Recent';
import NewProject from '../components/NewProject';

function Home() {
    return (
        <div className="spaced">
            <NewProject />
            <Recent />
        </div>
    )
}

export default Home;