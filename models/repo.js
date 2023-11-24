import { Schema, model, models } from 'mongoose';

const RepoSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  cid: {
    type: String,
    unique: [true, 'This repo already exists'],
    required: [true, 'cid is required']
  },
  github_username: {
    type: String,
    required: [true, 'Github username is required']
  },
  repo_name: {
    type: String,
    required: [true, 'Repo name is required']
  },
  timestamp: {
    type: Date,
    required: [true, 'Time is required']
  }
});

const Repo = models.Repo || model('Repo', RepoSchema);

export default Repo;
