import { HashLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="w-full flex justify-center items-center" style={{
      alignItems: "center"
    }}>
      <HashLoader color="#6166B3" />
    </div>
  )
}

export default Loading;