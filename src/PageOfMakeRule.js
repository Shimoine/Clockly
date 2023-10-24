import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';

function PageOfMakeRule() {
    return (
        <div>
            <h1>ルールの作成</h1>
            <Tabs /*onSelect={this.tab_select}*/>
                <TabList>
                    <Tab>Blockly</Tab>
                    <Tab>JavaScript</Tab>
                    <Tab>Ruby</Tab>
                </TabList>
                <TabPanel>
                    Blockly
                </TabPanel>
                <TabPanel>
                    JavaScript
                </TabPanel>
                <TabPanel>
                    Ruby
                </TabPanel>
            </Tabs>
        </div>
    );
}
export default PageOfMakeRule;
