import { HashLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div role="status" aria-label="Loading" className="w-full flex justify-center items-center">
      <HashLoader color="#6166B3" />
    </div>
  )
}

export default Loading;
