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
                        id: programs[i].id,
                        name: programs[i].name,
                        blockXml: programs[i].block,
                        jsCode: programs[i].code,
                        rbCode: programs[i].rbcode,
                        calendar_id_list: programs[i].calendar_id_list,
                        enable_auto: programs[i].enable_auto
                    };
                    rule_list = [...rule_list, rule]
                }
                setRules(rule_list);
            });
    }, []);

    const removeRule = (id) => {
        if (window.confirm("本当に削除してよろしいですか？")) {
            fetch("/delete_program", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id })
            })
            .then(response => {
                if (response.ok) {
                    alert("削除が完了しました。");
                    // 状態を更新してリストを再描画
                    setRules(prevRules => prevRules.filter(rule => rule.id !== id));
                } else {
                    alert("削除に失敗しました。");
                }
            })
            .catch(error => {
                console.error("削除エラー:", error);
                alert("削除中にエラーが発生しました。");
            });
        }
    };

    return (
        <div>
            <h1>RuleList</h1>
            <p/>
            <CardColumns>
                {rules.map((rule,i) => (
                    // <Rule rule={rule}/>
                    <Rule key={rule.id} rule={rule} onRemove={removeRule} />
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
