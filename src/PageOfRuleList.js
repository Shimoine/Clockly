import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import CardColumns from 'react-bootstrap/Card'
import Rule from './Rule';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function PageOfRuleList() {
    const [rules, setRules] = useState([]);
    useEffect(() => {
        fetch( "/programs/")
            .then( response => response.json() )
            .then( programs => {
                var rule_list = [];
                for(let i in programs) {
                    var rule = {
                        name: programs[i].name,
                        blockXml: programs[i].block,
                        code: programs[i].code
                    };
                    rule_list = [...rule_list, rule]
                }
                setRules(rule_list);
            });
    }, []);

    return (
        <div>
            <h1>RuleList</h1>
            <p/>
            <CardColumns>
                {rules.map((rule,i) => (
                    <Rule rule={rule}/>
                ))}
            </CardColumns>
            <Link to="/make">
                <Button variant="outline-success">
                    新しいルールを作成
                </Button>
            </Link>&nbsp;
        </div>
    );
}
export default PageOfRuleList;
