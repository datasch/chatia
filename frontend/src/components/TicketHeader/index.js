import React from "react";
import { Card, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		alignItems: "center",
		background: theme.mode === "dark" ? "rgba(18, 18, 28, 0.85)" : "#ffffff",
		backdropFilter: "blur(12px)",
		WebkitBackdropFilter: "blur(12px)",
		flex: "none",
		borderBottom: theme.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
		height: "65px",
		padding: "0 12px",
		boxShadow: "none",
		borderRadius: 0,
		zIndex: 2,
		[theme.breakpoints.down("sm")]: {
			flexWrap: "wrap",
			height: "max-content",
			padding: "8px",
		},
	},
	backBtn: {
		minWidth: "36px",
		width: "36px",
		height: "36px",
		borderRadius: "10px",
		padding: 0,
		marginRight: "8px",
		color: theme.mode === "dark" ? "#cbd5e1" : "#475569",
		background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
		"&:hover": {
			color: "#06b6d4",
			background: "rgba(6, 182, 212, 0.12)",
		},
		"& .MuiSvgIcon-root": {
			fontSize: "1rem",
			marginLeft: "4px",
		},
	},
}));

const TicketHeader = ({ loading, children }) => {
	const classes = useStyles();
	const history = useHistory();

	const handleBack = () => {
		history.push("/tickets");
	};

	return (
		<>
			{loading ? (
				<TicketHeaderSkeleton />
			) : (
				<Card
					square
					className={classes.ticketHeader}
				>
					<Button className={classes.backBtn} onClick={handleBack}>
						<ArrowBackIos />
					</Button>
					{children}
				</Card>
			)}
		</>
	);
};

export default TicketHeader;
