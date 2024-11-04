export interface IVotingIntention {
  label: string[];
  percentages: { [intention: string]: number[] };
}
