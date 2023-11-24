import { Schema, model, models } from 'mongoose';

const RecommendationSchema = new Schema({
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    repo_id: {
      type: Schema.Types.ObjectId,
      ref: 'Repo',
      required: [true, 'Repo id is required']
    },
    similarity_distance: {
      type: Number,
      required: [true, 'Similarity distance is required']
    },
    skillset: {
      type: String,
      required: [true, 'Skillset is required']
    }
});

const Recommendation = models.Recommendation || model('Recommendation', RecommendationSchema);

export default Recommendation;
