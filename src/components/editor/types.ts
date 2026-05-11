export type PageId = 1 | 2 | 3;

export type ChipState = "hidden" | "visible" | "applied" | "ignored";

export interface PageData {
  id: PageId;
  heading: string;
  subheading: string;
  body: string;
  logoPos: { x: number; y: number };
  hadSnapped: boolean;
  headingX: number;
  bodyX: number;
  chipState: ChipState;
  showCheck: boolean;
}

export const SNAP_X = 40;
export const SNAP_Y = 40;
export const SNAP_RADIUS = 10;

// Canvas is 720 wide / 12 cols → grid line every 60px. Column 1 line = x:60.
export const COL1_X = 60;

export const initialPages: PageData[] = [
  {
    id: 1,
    heading: "Q4 Strategy Review",
    subheading: "Quarterly Business Update",
    body: "An overview of strategic initiatives, milestones, and outcomes shaping our path into the next fiscal year.",
    logoPos: { x: SNAP_X, y: SNAP_Y },
    hadSnapped: true,
    headingX: 180,
    bodyX: 200,
    chipState: "hidden",
    showCheck: false,
  },
  {
    id: 2,
    heading: "Revenue Highlights",
    subheading: "Q4 Performance Metrics",
    body: "Topline growth, segment performance, and the customer cohorts driving the strongest returns this quarter.",
    logoPos: { x: SNAP_X, y: SNAP_Y },
    hadSnapped: true,
    headingX: 220,
    bodyX: 160,
    chipState: "hidden",
    showCheck: false,
  },
  {
    id: 3,
    heading: "Next Quarter Goals",
    subheading: "FY26 Q1 Priorities",
    body: "Where we're investing next, the bets we're doubling down on, and the operating cadence to get us there.",
    logoPos: { x: SNAP_X, y: SNAP_Y },
    hadSnapped: true,
    headingX: 160,
    bodyX: 240,
    chipState: "hidden",
    showCheck: false,
  },
];
