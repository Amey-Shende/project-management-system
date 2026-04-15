import { Spinner } from './ui/spinner'

function Loader() {
    return (
        <div className="min-h-screen flex justify-center items-center" >
            <Spinner className="flex justify-center items-center size-10 text-gray-700" />
        </div>
    )
}

export default Loader

