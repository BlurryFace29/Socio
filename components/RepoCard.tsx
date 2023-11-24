type RepoCardProps = {
  githubUsername: string;
  repoName: string;
  description: string;
  repoLink: string;
};

const RepoCard: React.FC<RepoCardProps> = ({ githubUsername, repoName, description, repoLink }) => {
  return (
    <a href={repoLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ 
        border: '1px solid #e1e4e8', 
        borderRadius: '6px', 
        padding: '16px', 
        marginBottom: '16px', 
        cursor: 'pointer', 
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
      }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '12px' }}>
          {githubUsername} / {repoName}
        </h3>
        <p>{description}</p>
      </div>
    </a>
  );
}

export default RepoCard;
