import { Schema, model, models } from 'mongoose';

const SkillsetSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  skill: {
    type: String,
    required: [true, 'Skill is required']
  }
});

const Skillset = models.Skillset || model('Skillset', SkillsetSchema);

export default Skillset;
