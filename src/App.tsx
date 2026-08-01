import styles from "./App.module.css";
import { ProjectConfigProvider } from "./projectConfig/projectConfigProvider";
import { DevTool } from "./ui/debugger/DevTool";
import { MenuProvider } from "./ui/menuPanels/menuProvider";
import { MenuPanels } from "./ui/menuPanels/panel";
import { RightPanel } from "./ui/rightPanel/rightPanel";
import { ToolSettings, Tools } from "./ui/topBar";

function App() {
	// Check if debug=1 parameter is in the URL
	const urlParams = new URLSearchParams(window.location.search);
	const isDebugMode = urlParams.get("debug") === "1";

	return (
		<div class={styles.editor}>
			<MenuProvider>
				<ProjectConfigProvider>
					<ToolSettings />
					<div class={styles.row}>
						<Tools />
						<canvas
							id="main-canvas"
							class={styles.mainCanvas}
							width={1280}
							height={1280}
						/>
						<RightPanel />
						<MenuPanels />
					</div>
					{isDebugMode && <DevTool />}
				</ProjectConfigProvider>
			</MenuProvider>
		</div>
	);
}

export default App;
