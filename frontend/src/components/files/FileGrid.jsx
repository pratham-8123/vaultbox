import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import FileCard from './FileCard'

function FileGrid({ files }) {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onClick={() => navigate(`/file/${file.id}`)}
          showOwner={user?.role === 'ADMIN'}
        />
      ))}
    </div>
  )
}

export default FileGrid

