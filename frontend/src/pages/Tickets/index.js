import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";
import { i18n } from "../../translate/i18n";
import { getBackendUrl } from "../../config";
import socket from "../../services/socket";

const logo = "/logo-light.png";
const logoDark = "/logo-dark.png";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		padding: theme.padding || 0,
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
	},

	chatPapper: {
		display: "flex",
		height: "100%",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		background: theme.palette.tabHeaderBackground || (theme.mode === "dark" ? "#12121c" : "#f8fafc"),
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
		border: "none",
	},
	logo: {
		logo: theme.logo,
		maxWidth: "220px",
		maxHeight: "80px",
		objectFit: "contain",
		marginBottom: "16px",
		filter: theme.mode === "dark" ? "drop-shadow(0 2px 10px rgba(6, 182, 212, 0.3))" : "none",
	},
}));

function getCompanyIdFallback() {
	try {
		const saved = localStorage.getItem("user");
		if (saved) {
			const u = JSON.parse(saved);
			if (u?.companyId) return String(u.companyId);
			if (u?.company?.id) return String(u.company.id);
		}
		const cid = localStorage.getItem("companyId");
		if (cid) return String(cid);
	} catch (_) {}
	return "1";
}

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();
	const [bump, setBump] = useState(0);

	useEffect(() => {
		if (!ticketId) return;

		const ioMaybe = (socket && (socket.default || socket)) || null;
		const io =
			ioMaybe && typeof ioMaybe === "function" ? ioMaybe() : ioMaybe || (window && (window as any).socket);

		if (!io || !io.emit || !io.on) return;

		const companyId = getCompanyIdFallback();

		console.log("🔌 [Tickets/index] Conectando ao chat box:", ticketId);
		io.emit("joinChatBox", ticketId);

		const applyAckUpdate = (payload: any) => {
			const pTicketId = payload?.message?.ticketId ?? payload?.ticketId;
			const pTicketUuid = payload?.ticket?.uuid ?? payload?.message?.ticket?.uuid;

			if (pTicketUuid && String(pTicketUuid) !== String(ticketId)) return;

			console.log("🔄 [Tickets/index] Atualizando mensagem para ticket:", ticketId);
			setBump(b => (b + 1) % 1000);
		};

		const mainEvent = `company-${companyId}-appMessage`;
		io.on(mainEvent, applyAckUpdate);

		return () => {
			console.log("🔌 [Tickets/index] Desconectando do chat box:", ticketId);
			io.off(mainEvent, applyAckUpdate);
			io.emit("joinChatBoxLeave", ticketId);
		};
	}, [ticketId]);

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								<Ticket _ackRefreshSignal={bump} />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px" }}>
									<img
										src={logoDark}
										className={classes.logo}
										alt="Gissap CRM"
									/>
									<span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>
										{i18n.t("chat.noTicketMessage")}
									</span>
								</div>
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
