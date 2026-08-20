import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
	title: {
		marginBottom: 0,
		whiteSpace: "nowrap",
		fontWeight: 700,
		fontSize: "1.25rem",
		letterSpacing: "-0.02em",
		color: theme.mode === "dark" ? "#f8fafc" : "#0f172a",
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
}));

export default function Title(props) {
	const classes = useStyles();
	return (
		<Typography component="h1" variant="h6" className={classes.title}>
			{props.children}
		</Typography>
	);
}
